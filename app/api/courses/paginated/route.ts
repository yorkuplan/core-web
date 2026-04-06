import { fetchApiData } from "@/lib/api/utils"
import { NextRequest } from "next/server"

// Allowlist of query parameters that may be forwarded to the backend
const ALLOWED_PARAMS = new Set(["page", "page_size", "faculty", "course_code_range", "term", "q", "sort"])

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  // Only forward known, safe parameters — prevents parameter injection
  const safeParams = new URLSearchParams()
  for (const [key, value] of searchParams.entries()) {
    if (ALLOWED_PARAMS.has(key)) {
      safeParams.append(key, value)
    }
  }

  const queryString = safeParams.toString()
  const endpoint = `/courses/paginated${queryString ? `?${queryString}` : ""}`

  return fetchApiData(
    endpoint,
    "Failed to fetch paginated courses",
    "Failed to fetch paginated courses:",
    {
      cache: "default",
      fallbackCacheControl: "public, max-age=21600, stale-while-revalidate=86400",
    }
  )
}
