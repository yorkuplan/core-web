import { NextResponse } from "next/server"

const API_URL = process.env.API_URL || "http://localhost:8080/api/v1"

export async function GET() {
  try {
    const response = await fetch(`${API_URL}/courses`, {
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    return NextResponse.json(data)
  } catch (error) {
    console.error("Failed to fetch courses:", error)
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    )
  }
}