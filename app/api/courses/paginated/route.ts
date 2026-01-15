import { fetchApiData } from "@/lib/api/utils"
import { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  
  // Build query string from all search params
  const queryString = searchParams.toString()
  const endpoint = `/courses/paginated${queryString ? `?${queryString}` : ""}`
  
  return fetchApiData(
    endpoint,
    "Failed to fetch paginated courses",
    "Failed to fetch paginated courses:"
  )
}
