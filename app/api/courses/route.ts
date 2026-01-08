import { fetchApiData } from "@/lib/api/utils"

export async function GET() {
  return fetchApiData(
    "/courses",
    "Failed to fetch courses",
    "Failed to fetch courses:"
  )
}
