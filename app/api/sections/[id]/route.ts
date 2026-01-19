import { fetchApiData, getRouteParam } from "@/lib/api/utils"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = await getRouteParam(params, "id")
    return fetchApiData(
      `/sections/${id}`,
      "Failed to fetch sections",
      `Failed to fetch sections for course ${id}:`
    )
  } catch (error) {
    return NextResponse.json(
      { error: "Section ID is required" },
      { status: 400 }
    )
  }
}
