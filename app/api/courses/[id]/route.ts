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
      `Failed to fetch course ${courseCode}:`
    )
  } catch {
    return NextResponse.json(
      { error: "Course code is required" },
      { status: 400 }
    )
  }
}
