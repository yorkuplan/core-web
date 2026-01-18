import { NextResponse } from "next/server"

export const API_URL = process.env.API_URL || "http://localhost:8080/api/v1"

// Log API_URL in production to debug (remove in production if needed)
if (process.env.NODE_ENV === 'production') {
  console.log('API_URL configured:', API_URL ? 'Set' : 'Missing', API_URL)
}

// Validate API_URL is set in production
if (process.env.NODE_ENV === 'production' && !process.env.API_URL) {
  console.error('WARNING: API_URL environment variable is not set in production!')
}

export interface ApiErrorResponse {
  error: string
}

/**
 * Makes a fetch request to the backend API and handles errors uniformly
 */
export async function fetchFromApi(
  endpoint: string,
  options?: RequestInit
): Promise<Response> {
  if (!API_URL) {
    throw new Error("API_URL is not configured. Please set the API_URL environment variable.")
  }
  
  const url = `${API_URL}${endpoint}`
  console.log('Fetching from:', url) // Debug log
  
  try {
    const response = await fetch(url, {
      cache: "no-store",
      ...options,
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'No error body')
      console.error(`API Error ${response.status}:`, errorText)
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return response
  } catch (error) {
    console.error('Fetch error:', error)
    throw error
  }
}

/**
 * Handles API route errors and returns a standardized error response
 */
export function handleApiError(
  error: unknown,
  message: string,
  consoleContext?: string
): NextResponse<ApiErrorResponse> {
  const logMessage = consoleContext || message
  console.error(logMessage, error)

  return NextResponse.json({ error: message }, { status: 500 })
}

/**
 * Fetches data from an API endpoint and returns it as JSON
 * Handles errors automatically
 */
export async function fetchApiData<T>(
  endpoint: string,
  errorMessage: string,
  consoleContext?: string
): Promise<NextResponse<T | ApiErrorResponse>> {
  try {
    const response = await fetchFromApi(endpoint)
    
    // Check if response has content before parsing
    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text()
      console.error("Non-JSON response received:", text.substring(0, 200))
      throw new Error("API returned non-JSON response")
    }
    
    const data = await response.json()
    
    // Ensure data is not null or undefined
    if (data === null || data === undefined) {
      console.error("API returned null or undefined data")
      throw new Error("API returned empty response")
    }
    
    return NextResponse.json(data)
  } catch (error) {
    return handleApiError(error, errorMessage, consoleContext)
  }
}

/**
 * Helper to extract and await params in Next.js 15+ dynamic routes
 * Handles both Next.js 15+ (Promise) and older versions (object)
 */
export async function getRouteParam(
  params: Promise<Record<string, string>> | Record<string, string> | undefined | null,
  key: string
): Promise<string> {
  if (!params) {
    throw new Error(`Route parameter '${key}' is missing`)
  }
  
  // Handle Next.js 15+ Promise-based params
  if (params instanceof Promise) {
    const resolvedParams = await params
    if (!resolvedParams || typeof resolvedParams !== 'object') {
      throw new Error(`Route parameter '${key}' is missing`)
    }
    return resolvedParams[key]
  }
  
  // Handle older Next.js versions or direct object params
  if (typeof params === 'object') {
    return params[key]
  }
  
  throw new Error(`Route parameter '${key}' is missing`)
}
