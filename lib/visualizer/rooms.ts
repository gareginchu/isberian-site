/**
 * Stock rooms for the visualizer (v0). Each room is a photograph + a
 * placement quadrilateral marking where a rug sits on the floor.
 *
 * Coordinates are in the photo's intrinsic pixel space. Quadrilateral
 * corners are ordered top-left → top-right → bottom-right → bottom-left
 * where "top" is the edge of the rug farthest from the camera and
 * "bottom" is the edge closest to the camera. Same convention as the
 * source rectangle (0,0)→(W,0)→(W,H)→(0,H) inside the rug image.
 *
 * Adding a room: drop a JPG in `public/visualizer/rooms/`, record its
 * intrinsic width × height, and estimate the four corners by eye in an
 * image editor. Refinement is editorial — start with a rough quad and
 * tighten it after seeing a few rugs warped in.
 */

export type Point = readonly [number, number];

export type Quadrilateral = {
  topLeft: Point;
  topRight: Point;
  bottomRight: Point;
  bottomLeft: Point;
};

export type RoomSlot =
  | "living-traditional"
  | "living-modern"
  | "dining"
  | "bedroom"
  | "office"
  | "foyer"
  | "stair"
  | "loft";

export type Room = {
  slug: RoomSlot;
  label: string;
  description: string;
  src: string;
  width: number;
  height: number;
  placement: Quadrilateral;
  recommendedSize?: "small" | "medium" | "large" | "runner";
  notes?: string;
};

export const ROOMS: Room[] = [
  // Dining (public/visualizer/rooms/dining.jpg) is deliberately not yet in v0.
  // Dining rugs sit UNDER the table — visualizing that needs an alpha mask of
  // the table + chairs as occluding geometry. Without that mask the rug renders
  // ON TOP of the furniture, which reads worse than no visualization at all.
  // The room photo is staying on disk for the eventual masked-render pass.

  {
    slug: "bedroom",
    label: "Bedroom",
    description:
      "Light, contemporary bedroom with a queen bed, light-wood floor, and a window to the left.",
    src: "/visualizer/rooms/bedroom.jpg",
    width: 3800,
    height: 2533,
    // Floor in front of the bed. Light wood; most rugs read well against it.
    placement: {
      topLeft: [1300, 1750],
      topRight: [2800, 1750],
      bottomRight: [3400, 2480],
      bottomLeft: [500, 2480],
    },
    recommendedSize: "large",
    notes: "Generous rug zone at the foot of the bed. Works for 5×8 through 9×12.",
  },
  {
    slug: "foyer",
    label: "Foyer",
    description:
      "Traditional entry hall with an arched threshold, chandelier, and dark wood floor.",
    src: "/visualizer/rooms/foyer.jpg",
    width: 2576,
    height: 3568,
    // One-point perspective hallway. Narrow at the back, wider at the front.
    placement: {
      topLeft: [1080, 880],
      topRight: [1500, 880],
      bottomRight: [2400, 3500],
      bottomLeft: [180, 3500],
    },
    recommendedSize: "runner",
    notes: "Runner zone with strong one-point perspective. Best for long narrow runners.",
  },
];

export function getRoom(slug: string): Room | undefined {
  return ROOMS.find((r) => r.slug === slug);
}
