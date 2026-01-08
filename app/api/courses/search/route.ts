import { NextRequest, NextResponse } from "next/server"
import { fetchApiData } from "@/lib/api/utils"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get("q")

  if (!query) {
    return NextResponse.json(
      { error: "Query parameter required" },
      { status: 400 }
    )
  }

  return fetchApiData(
    `/courses/search?q=${encodeURIComponent(query)}`,
    "Failed to search courses",
    "Failed to search courses:"
  )
}
