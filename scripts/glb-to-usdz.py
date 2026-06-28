"""
Convert a .glb (binary glTF) rug model to .usdz for iOS Quick Look AR.

The rug GLBs we generate are dead-simple: one mesh (a textured plane) sized
to real-world dimensions, with an unlit-ish material that has a base-color
texture and (optionally) a normal map. That makes the conversion to USDZ
straightforward — we don't need to handle skinned meshes, animation,
multi-material, or any of the harder bits.

Steps:
  1. Read the GLB via pygltflib — extract mesh attributes (positions, UVs,
     normals, indices) + texture binary.
  2. Build a USD stage with Pixar's pxr library:
       - Xform → Mesh with above attributes
       - UsdPreviewSurface material with the texture
  3. Save USD to a temp .usda + write texture(s) alongside.
  4. Pack the directory as USDZ via UsdUtils.CreateNewUsdzPackage.

Usage:
    python scripts/glb-to-usdz.py <glb_path> <usdz_path>
"""
import sys
import os
import struct
import tempfile
import shutil
from pathlib import Path

from pygltflib import GLTF2
from pxr import Usd, UsdGeom, UsdShade, UsdUtils, Sdf, Gf


def read_glb_buffer_view(gltf: GLTF2, glb_path: str, view_idx: int) -> bytes:
    """Read the bytes for a glTF bufferView from the GLB's embedded BIN chunk."""
    view = gltf.bufferViews[view_idx]
    # In binary glTF (.glb), there is a single buffer with no URI; bytes live
    # in the GLB's BIN chunk. pygltflib gives us the embedded binary blob.
    blob = gltf.binary_blob()
    offset = view.byteOffset or 0
    return bytes(blob[offset : offset + view.byteLength])


def decode_accessor_floats(gltf, glb_path, accessor_idx, components):
    """Pull a float array out of an accessor (positions, normals, uvs)."""
    acc = gltf.accessors[accessor_idx]
    raw = read_glb_buffer_view(gltf, glb_path, acc.bufferView)
    count = acc.count
    fmt = f"<{count * components}f"
    return list(struct.unpack(fmt, raw[: count * components * 4]))


def decode_accessor_indices(gltf, glb_path, accessor_idx):
    """Pull an index array out of an accessor."""
    acc = gltf.accessors[accessor_idx]
    raw = read_glb_buffer_view(gltf, glb_path, acc.bufferView)
    # 5121=u8, 5123=u16, 5125=u32
    if acc.componentType == 5121:
        fmt, size = "B", 1
    elif acc.componentType == 5123:
        fmt, size = "H", 2
    elif acc.componentType == 5125:
        fmt, size = "I", 4
    else:
        raise ValueError(f"unsupported index type {acc.componentType}")
    count = acc.count
    return list(struct.unpack(f"<{count}{fmt}", raw[: count * size]))


def extract_image(gltf, glb_path, image_idx, out_dir, name_hint):
    """Extract a glTF image (referenced by bufferView) to a file. Returns filename."""
    img = gltf.images[image_idx]
    raw = read_glb_buffer_view(gltf, glb_path, img.bufferView)
    mime = img.mimeType or "image/png"
    ext = ".jpg" if "jpeg" in mime else ".png"
    fname = f"{name_hint}{ext}"
    with open(os.path.join(out_dir, fname), "wb") as f:
        f.write(raw)
    return fname


def convert(glb_path: str, usdz_path: str) -> None:
    gltf = GLTF2().load(glb_path)
    if not gltf.meshes or not gltf.meshes[0].primitives:
        raise ValueError("no mesh primitive in GLB")
    prim = gltf.meshes[0].primitives[0]

    positions = decode_accessor_floats(gltf, glb_path, prim.attributes.POSITION, 3)
    normals = (
        decode_accessor_floats(gltf, glb_path, prim.attributes.NORMAL, 3)
        if prim.attributes.NORMAL is not None
        else None
    )
    uvs = decode_accessor_floats(gltf, glb_path, prim.attributes.TEXCOORD_0, 2)
    indices = decode_accessor_indices(gltf, glb_path, prim.indices)

    # Material + textures.
    color_tex_file: str | None = None
    normal_tex_file: str | None = None

    work_dir = Path(tempfile.mkdtemp(prefix="usdz_"))
    try:
        if prim.material is not None:
            mat = gltf.materials[prim.material]
            pbr = mat.pbrMetallicRoughness
            if pbr and pbr.baseColorTexture is not None:
                color_tex_idx = gltf.textures[pbr.baseColorTexture.index].source
                color_tex_file = extract_image(gltf, glb_path, color_tex_idx, work_dir, "color")
            if mat.normalTexture is not None:
                normal_tex_idx = gltf.textures[mat.normalTexture.index].source
                normal_tex_file = extract_image(gltf, glb_path, normal_tex_idx, work_dir, "normal")

        # Build USD stage.
        usda_path = work_dir / "rug.usda"
        stage = Usd.Stage.CreateNew(str(usda_path))
        UsdGeom.SetStageUpAxis(stage, UsdGeom.Tokens.y)
        UsdGeom.SetStageMetersPerUnit(stage, 1.0)

        root = UsdGeom.Xform.Define(stage, "/Rug")
        mesh = UsdGeom.Mesh.Define(stage, "/Rug/Mesh")
        pts = [Gf.Vec3f(positions[i], positions[i + 1], positions[i + 2]) for i in range(0, len(positions), 3)]
        mesh.CreatePointsAttr(pts)
        mesh.CreateFaceVertexCountsAttr([3] * (len(indices) // 3))
        mesh.CreateFaceVertexIndicesAttr(indices)
        if normals:
            n_vecs = [Gf.Vec3f(normals[i], normals[i + 1], normals[i + 2]) for i in range(0, len(normals), 3)]
            mesh.CreateNormalsAttr(n_vecs)
            mesh.SetNormalsInterpolation(UsdGeom.Tokens.vertex)
        # UVs as primvar (st)
        st_pv = UsdGeom.PrimvarsAPI(mesh).CreatePrimvar(
            "st", Sdf.ValueTypeNames.TexCoord2fArray, UsdGeom.Tokens.vertex
        )
        st_pv.Set([Gf.Vec2f(uvs[i], uvs[i + 1]) for i in range(0, len(uvs), 2)])

        # Material with UsdPreviewSurface — what iOS Quick Look reads.
        material = UsdShade.Material.Define(stage, "/Rug/Mat")
        surface = UsdShade.Shader.Define(stage, "/Rug/Mat/Surface")
        surface.CreateIdAttr("UsdPreviewSurface")
        surface.CreateInput("roughness", Sdf.ValueTypeNames.Float).Set(0.85)
        surface.CreateInput("metallic", Sdf.ValueTypeNames.Float).Set(0.0)
        material.CreateSurfaceOutput().ConnectToSource(surface.ConnectableAPI(), "surface")

        st_reader = UsdShade.Shader.Define(stage, "/Rug/Mat/StReader")
        st_reader.CreateIdAttr("UsdPrimvarReader_float2")
        st_reader.CreateInput("varname", Sdf.ValueTypeNames.Token).Set("st")

        if color_tex_file:
            tex = UsdShade.Shader.Define(stage, "/Rug/Mat/ColorTex")
            tex.CreateIdAttr("UsdUVTexture")
            tex.CreateInput("file", Sdf.ValueTypeNames.Asset).Set(f"./{color_tex_file}")
            tex.CreateInput("st", Sdf.ValueTypeNames.Float2).ConnectToSource(
                st_reader.ConnectableAPI(), "result"
            )
            tex.CreateOutput("rgb", Sdf.ValueTypeNames.Float3)
            surface.CreateInput("diffuseColor", Sdf.ValueTypeNames.Color3f).ConnectToSource(
                tex.ConnectableAPI(), "rgb"
            )

        if normal_tex_file:
            ntex = UsdShade.Shader.Define(stage, "/Rug/Mat/NormalTex")
            ntex.CreateIdAttr("UsdUVTexture")
            ntex.CreateInput("file", Sdf.ValueTypeNames.Asset).Set(f"./{normal_tex_file}")
            ntex.CreateInput("st", Sdf.ValueTypeNames.Float2).ConnectToSource(
                st_reader.ConnectableAPI(), "result"
            )
            ntex.CreateInput("scale", Sdf.ValueTypeNames.Float4).Set(Gf.Vec4f(2.0, 2.0, 2.0, 1.0))
            ntex.CreateInput("bias", Sdf.ValueTypeNames.Float4).Set(Gf.Vec4f(-1.0, -1.0, -1.0, 0.0))
            ntex.CreateOutput("rgb", Sdf.ValueTypeNames.Float3)
            surface.CreateInput("normal", Sdf.ValueTypeNames.Normal3f).ConnectToSource(
                ntex.ConnectableAPI(), "rgb"
            )

        UsdShade.MaterialBindingAPI(mesh).Bind(material)
        stage.SetDefaultPrim(root.GetPrim())
        stage.GetRootLayer().Save()

        # Pack as USDZ.
        Path(os.path.dirname(usdz_path) or ".").mkdir(parents=True, exist_ok=True)
        ok = UsdUtils.CreateNewUsdzPackage(str(usda_path), usdz_path)
        if not ok:
            raise RuntimeError("CreateNewUsdzPackage returned false")
    finally:
        shutil.rmtree(work_dir, ignore_errors=True)


def main():
    if len(sys.argv) < 3:
        print("usage: python scripts/glb-to-usdz.py <glb> <usdz>")
        sys.exit(1)
    glb, usdz = sys.argv[1], sys.argv[2]
    convert(glb, usdz)
    sz = os.path.getsize(usdz) / 1024
    print(f"  {Path(glb).stem}: {sz:.0f} KB")


if __name__ == "__main__":
    main()
