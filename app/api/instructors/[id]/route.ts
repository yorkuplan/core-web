import { fetchApiData, getRouteParam } from "@/lib/api/utils"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = await getRouteParam(params, "id")
    return fetchApiData(
      `/instructors/${id}`,
      "Failed to fetch instructors",
      `Failed to fetch instructors for course ${id}:`
    )
  } catch (error) {
    return NextResponse.json(
      { error: "Instructor ID is required" },
      { status: 400 }
    )
  }
}
