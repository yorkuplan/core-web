import { fetchApiData, getRouteParam } from "@/lib/api/utils"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = await getRouteParam(params, "id")
    return fetchApiData(
      `/courses/${id}`,
      "Failed to fetch course",
      `Failed to fetch course ${id}:`
    )
  } catch (error) {
    return NextResponse.json(
      { error: "Course ID is required" },
      { status: 400 }
    )
  }
}
