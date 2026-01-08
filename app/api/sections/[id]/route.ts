import { fetchApiData, getRouteParam } from "@/lib/api/utils"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = await getRouteParam(params, "id")
  return fetchApiData(
    `/sections/${id}`,
    "Failed to fetch sections",
    `Failed to fetch sections for course ${id}:`
  )
}
