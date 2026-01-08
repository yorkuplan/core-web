import { fetchApiData, getRouteParam } from "@/lib/api/utils"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = await getRouteParam(params, "id")
  return fetchApiData(
    `/instructors/${id}`,
    "Failed to fetch instructors",
    `Failed to fetch instructors for course ${id}:`
  )
}
