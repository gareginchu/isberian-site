import type { ImageLoaderProps } from "next/image";

/**
 * Cloudinary image loader for next/image. Generates URLs with the responsive `w_`, `q_`, `f_auto`,
 * and `c_fill` transforms. Falls back to passing through fully-qualified URLs unchanged — that
 * lets the fixtures use external placeholders during development without breaking.
 */
export function cloudinaryLoader({ src, width, quality }: ImageLoaderProps): string {
  if (src.startsWith("http")) {
    // Pass-through for absolute URLs (placeholder fixtures). next/image still requests sized
    // variants, but the upstream CDN handles the transform.
    return src;
  }
  const base = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    ? `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`
    : "https://res.cloudinary.com/demo/image/upload";
  const transforms = ["f_auto", "c_fill", `w_${width}`, `q_${quality ?? 80}`].join(",");
  return `${base}/${transforms}/${src}`;
}
