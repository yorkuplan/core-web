import { fetchApiData, fetchFromApi } from "@/lib/api/utils"
import { getTermBucket } from "@/lib/term-buckets"
import { NextRequest } from "next/server"

// Allowlist of query parameters that may be forwarded to the backend
const ALLOWED_PARAMS = new Set(["page", "page_size", "faculty", "course_code_range", "term", "q", "sort"])

type CourseLike = {
  id: string
  code: string
  name: string
  faculty: string
  term?: string
  [key: string]: unknown
}

let allCoursesCache: { data: CourseLike[]; expiresAt: number } | null = null
let allCoursesLoadPromise: Promise<CourseLike[]> | null = null

const CACHE_MS = 30 * 60 * 1000
const STALE_CACHE_MS = 6 * 60 * 60 * 1000

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getErrorStatus(error: unknown): number | null {
  if (!(error instanceof Error)) return null
  const match = error.message.match(/API Error:\s*(\d{3})/)
  return match ? Number(match[1]) : null
}

async function fetchPageWithRetry(page: number, pageSize: number): Promise<any> {
  const maxAttempts = 3

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetchFromApi(`/courses/paginated?page=${page}&page_size=${pageSize}`)
      return await response.json()
    } catch (error) {
      const status = getErrorStatus(error)
      const isRateLimited = status === 429
      const isLastAttempt = attempt === maxAttempts

      if (!isRateLimited || isLastAttempt) {
        throw error
      }

      // Exponential backoff for backend rate-limiting
      await sleep(250 * attempt * attempt)
    }
  }

  throw new Error("Failed to fetch paginated courses page")
}
function matchesRequestedTerm(courseTerm: string | undefined, requested: string | null): boolean {
  if (!requested) return true

  const normalizedRequested = requested.trim().toUpperCase()
  const bucket = getTermBucket(courseTerm)

  if (normalizedRequested === "SU" || normalizedRequested === "FW") {
    return bucket === normalizedRequested
  }

  return (courseTerm ?? "").trim().toUpperCase() === normalizedRequested
}

function matchesCourseCodeRange(code: string, range?: string): boolean {
  if (!range) return true

  const normalizedCode = (code ?? "").replace(/\s+/g, "")
  const match = normalizedCode.match(/(\d{4})/)
  if (!match) return false

  const level = Math.floor(Number(match[1]) / 1000) * 1000

  const expected = {
    "1000s": 1000,
    "2000s": 2000,
    "3000s": 3000,
    "4000s": 4000,
    "5000s": 5000,
    "6000s": 6000,
    "7000s": 7000,
    "8000s": 8000,
    "9000s": 9000,
  }[range]

  if (!expected) return true
  return level === expected
}

function dedupeByCode(items: CourseLike[]): CourseLike[] {
  const seen = new Set<string>()
  const out: CourseLike[] = []

  for (const item of items) {
    const key = (item.code ?? "").replace(/\s+/g, "").toUpperCase()
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push(item)
  }

  return out
}

async function loadAllCourses(): Promise<CourseLike[]> {
  const now = Date.now()
  if (allCoursesCache && allCoursesCache.expiresAt > now) {
    return allCoursesCache.data
  }

  // Single-flight: share one in-progress load across concurrent requests.
  if (allCoursesLoadPromise) {
    return allCoursesLoadPromise
  }

  allCoursesLoadPromise = (async () => {
    try {
      const pageSize = 20
      const firstJson = await fetchPageWithRetry(1, pageSize)

      const firstPageData = Array.isArray(firstJson)
        ? (firstJson as CourseLike[])
        : (firstJson?.data as CourseLike[]) || []

      const totalPages = Math.max(Number.parseInt(String(firstJson?.total_pages ?? 1), 10) || 1, 1)
      const allData: CourseLike[] = [...firstPageData]

      for (let page = 2; page <= totalPages; page++) {
        const json = await fetchPageWithRetry(page, pageSize)
        const pageData = Array.isArray(json)
          ? (json as CourseLike[])
          : (json?.data as CourseLike[]) || []
        if (pageData.length === 0) break
        allData.push(...pageData)
      }

      allCoursesCache = {
        data: allData,
        expiresAt: now + CACHE_MS,
      }

      return allData
    } catch (error) {
      // Serve stale cache during backend throttling, if available.
      if (allCoursesCache && allCoursesCache.expiresAt + STALE_CACHE_MS > now) {
        return allCoursesCache.data
      }
      throw error
    } finally {
      allCoursesLoadPromise = null
    }
  })()

  return allCoursesLoadPromise
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const requestedTerm = searchParams.get("term")

  // Backend term support is inconsistent; when term is requested, perform filtering
  // in this route so page metadata stays accurate.
  if (requestedTerm) {
    const page = Math.max(Number.parseInt(searchParams.get("page") || "1", 10) || 1, 1)
    const pageSize = Math.min(
      Math.max(Number.parseInt(searchParams.get("page_size") || "20", 10) || 20, 1),
      100,
    )
    const faculty = (searchParams.get("faculty") || "").trim().toUpperCase()
    const courseCodeRange = (searchParams.get("course_code_range") || "").trim()

    const allCourses = await loadAllCourses()
    const filtered = dedupeByCode(
      allCourses.filter((course) => {
        if (faculty && (course.faculty || "").trim().toUpperCase() !== faculty) {
          return false
        }
        if (courseCodeRange && !matchesCourseCodeRange(course.code || "", courseCodeRange)) {
          return false
        }
        if (!matchesRequestedTerm(course.term, requestedTerm)) {
          return false
        }
        return true
      }),
    )

    const totalItems = filtered.length
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
    const safePage = Math.min(page, totalPages)
    const start = (safePage - 1) * pageSize
    const data = filtered.slice(start, start + pageSize)

    return Response.json({
      data,
      page: safePage,
      page_size: pageSize,
      total_items: totalItems,
      total_pages: totalPages,
    })
  }

  // Only forward known, safe parameters — prevents parameter injection
  const safeParams = new URLSearchParams()
  for (const [key, value] of searchParams.entries()) {
    if (ALLOWED_PARAMS.has(key)) {
      safeParams.append(key, value)
    }
  }

  const queryString = safeParams.toString()
  const endpoint = `/courses/paginated${queryString ? `?${queryString}` : ""}`
  
  return fetchApiData(
    endpoint,
    "Failed to fetch paginated courses",
    "Failed to fetch paginated courses:"
  )
}
