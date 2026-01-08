import { fetchApiData, getRouteParam } from "@/lib/api/utils"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = await getRouteParam(params, "id")
  return fetchApiData(
    `/courses/${id}`,
    "Failed to fetch course",
    `Failed to fetch course ${id}:`
  )
}
