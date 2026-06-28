import { exportSeedsJson } from "@/lib/curator/store";

export async function GET() {
  const json = await exportSeedsJson();
  return new Response(json, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": 'attachment; filename="new-fixture-seeds.json"',
    },
  });
}
