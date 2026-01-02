import { NextResponse } from "next/server"

const API_URL = process.env.API_URL || "http://localhost:8080/api/v1"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const response = await fetch(`${API_URL}/instructors/${id}`, {
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    const { id } = await params
    console.error(`Failed to fetch instructors for course ${id}:`, error)
    return NextResponse.json(
      { error: "Failed to fetch instructors" },
      { status: 500 }
    )
  }
}
