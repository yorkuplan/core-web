import { fetchApiData } from "@/lib/api/utils"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    return await fetchApiData(
      "/courses",
      "Failed to fetch courses",
      "Failed to fetch courses:"
    )
  } catch (error) {
    console.error("Error in GET /api/courses:", error)
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    )
  }
}
