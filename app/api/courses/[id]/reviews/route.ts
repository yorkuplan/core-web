import { NextRequest, NextResponse } from "next/server"
import { fetchFromApi, getRouteParam, getApiUrl } from "@/lib/api/utils"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = await getRouteParam(params, "id")
    const body = await request.json()

    // Validate required fields
    const { email, author_name, liked, difficulty, real_world_relevance, review_text } = body

    if (!email || typeof liked !== "boolean" || !difficulty || !real_world_relevance || !review_text) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      )
    }

    // Length limits to prevent oversized payloads
    if (typeof review_text !== "string" || review_text.trim().length > 2000) {
      return NextResponse.json(
        { error: "Review text must be 2000 characters or fewer" },
        { status: 400 }
      )
    }
    if (author_name && (typeof author_name !== "string" || author_name.length > 100)) {
      return NextResponse.json(
        { error: "Author name must be 100 characters or fewer" },
        { status: 400 }
      )
    }

    // Validate ranges
    if (difficulty < 1 || difficulty > 5 || real_world_relevance < 1 || real_world_relevance > 5) {
      return NextResponse.json(
        { error: "Difficulty and real_world_relevance must be between 1 and 5" },
        { status: 400 }
      )
    }

    // Make request to backend API using the utility function
    const response = await fetchFromApi(`/courses/${id}/reviews`, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        author_name: author_name || null,
        liked,
        difficulty,
        real_world_relevance,
        review_text,
      }),
    })

    const data = await response.json()
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("Error submitting review:", error)
    
    // Check if it's a 409 conflict error
    if (error instanceof Error && error.message.includes("409")) {
      return NextResponse.json(
        { error: "You have already reviewed this course" },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to submit review" },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = await getRouteParam(params, "id")
    const searchParams = request.nextUrl.searchParams
    
    const sort = ["recent", "helpful", "oldest"].includes(searchParams.get("sort") ?? "")
      ? searchParams.get("sort")!
      : "recent"
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50)
    const offset = Math.min(Math.max(parseInt(searchParams.get("offset") || "0"), 0), 10000)

    // Build query string
    const queryParams = new URLSearchParams({
      sort,
      limit: limit.toString(),
      offset: offset.toString(),
    })

    // Make request to backend API using the utility function
    const response = await fetchFromApi(
      `/courses/${id}/reviews?${queryParams}`,
      {
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )

    const data = await response.json()
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    )
  }
}
