import { NextRequest, NextResponse } from "next/server"
import { fetchFromApi, getRouteParam, getApiUrl } from "@/lib/api/utils"

type CachedReviewsResponse = {
  data: unknown
  expiresAt: number
}

const REVIEWS_CACHE_TTL_MS = 30 * 1000
const REVIEWS_STALE_FALLBACK_MS = 5 * 60 * 1000
const reviewsCache = new Map<string, CachedReviewsResponse>()

function extractHttpStatus(error: unknown): number | null {
  if (!(error instanceof Error)) return null
  const match = error.message.match(/API Error:\s*(\d{3})/)
  return match ? Number(match[1]) : null
}

function getCachedReviews(cacheKey: string, allowStale = false): unknown | null {
  const cached = reviewsCache.get(cacheKey)
  if (!cached) return null

  const now = Date.now()
  if (cached.expiresAt > now) return cached.data

  if (allowStale && cached.expiresAt + REVIEWS_STALE_FALLBACK_MS > now) {
    return cached.data
  }

  return null
}

function setCachedReviews(cacheKey: string, data: unknown): void {
  reviewsCache.set(cacheKey, {
    data,
    expiresAt: Date.now() + REVIEWS_CACHE_TTL_MS,
  })
}

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

    const status = extractHttpStatus(error)

    // Check if it's a 409 conflict error
    if (error instanceof Error && error.message.includes("409")) {
      return NextResponse.json(
        { error: "You have already reviewed this course" },
        { status: 409 }
      )
    }

    if (status === 429) {
      return NextResponse.json(
        { error: "Too many review submissions right now. Please try again shortly." },
        { status: 429 }
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
    
    const sort = searchParams.get("sort") || "recent"
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50)
    const offset = parseInt(searchParams.get("offset") || "0")

    // Build query string
    const queryParams = new URLSearchParams({
      sort,
      limit: limit.toString(),
      offset: offset.toString(),
    })

    const cacheKey = `${id}|${sort}|${limit}|${offset}`
    const cached = getCachedReviews(cacheKey)
    if (cached) {
      return NextResponse.json(cached)
    }

    // Make request to backend API using the utility function
    const response = await fetchFromApi(
      `/courses/${id}/reviews?${queryParams}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    )

    const data = await response.json()
    setCachedReviews(cacheKey, data)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching reviews:", error)

    const id = await getRouteParam(params, "id").catch(() => "")
    const sort = request.nextUrl.searchParams.get("sort") || "recent"
    const limit = Math.min(parseInt(request.nextUrl.searchParams.get("limit") || "10"), 50)
    const offset = Math.min(Math.max(parseInt(request.nextUrl.searchParams.get("offset") || "0"), 0), 10000)
    const cacheKey = `${id}|${sort}|${limit}|${offset}`

    const status = extractHttpStatus(error)
    if (status === 429) {
      const staleCached = getCachedReviews(cacheKey, true)
      if (staleCached) {
        return NextResponse.json(staleCached)
      }

      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again shortly." },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    )
  }
}
