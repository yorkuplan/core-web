import { fetchApiData, getRouteParam } from "@/lib/api/utils"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const courseCode = await getRouteParam(params, "id")
    return fetchApiData(
      `/courses/${courseCode}`,
      "Failed to fetch course",
      `Failed to fetch course ${courseCode}:`,
      {
        cache: "default",
        fallbackCacheControl: "public, max-age=21600, stale-while-revalidate=86400",
      }
    )
  } catch {
    return NextResponse.json(
      { error: "Course code is required" },
      { status: 400 }
    )
  }
}
