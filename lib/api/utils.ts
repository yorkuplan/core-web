import { NextResponse } from "next/server"

// Get API_URL at runtime to ensure it's available in serverless environments
export function getApiUrl(): string {
  const apiUrl = process.env.API_URL || "http://localhost:8080/api/v1"
  
  // Validate API_URL is set in production
  if (process.env.NODE_ENV === 'production' && !process.env.API_URL) {
    console.error('WARNING: API_URL environment variable is not set in production!')
  }
  
  return apiUrl
}

// Export for backward compatibility, but prefer getApiUrl() for runtime access
export const API_URL = getApiUrl()

export interface ApiErrorResponse {
  error: string
}

const CACHE_HEADER_ALLOWLIST = [
  "cache-control",
  "etag",
  "last-modified",
  "expires",
  "vary",
] as const

type FetchApiDataOptions = RequestInit & {
  fallbackCacheControl?: string
}

/**
 * Makes a fetch request to the backend API and handles errors uniformly
 */
export async function fetchFromApi(
  endpoint: string,
  options?: RequestInit
): Promise<Response> {
  // Get API_URL at runtime to ensure it's available in serverless environments
  const apiUrl = getApiUrl()
  
  if (!apiUrl) {
    const error = "API_URL is not configured. Please set the API_URL environment variable."
    console.error('[fetchFromApi]', error)
    throw new Error(error)
  }
  
  const url = `${apiUrl}${endpoint}`
  
  try {
    const response = await fetch(url, options)

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'No error body')
      console.error(`[fetchFromApi] API Error ${response.status}:`, errorText.substring(0, 200))
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return response
  } catch (error) {
    console.error('[fetchFromApi] Fetch error:', error)
    if (error instanceof Error) {
      console.error('[fetchFromApi] Error details:', {
        message: error.message,
        stack: error.stack?.substring(0, 500)
      })
    }
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
  consoleContext?: string,
  options?: FetchApiDataOptions
): Promise<NextResponse<T | ApiErrorResponse>> {
  try {
    const response = await fetchFromApi(endpoint, options)
    
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
    
    const responseHeaders = new Headers()
    for (const headerName of CACHE_HEADER_ALLOWLIST) {
      const value = response.headers.get(headerName)
      if (value) {
        responseHeaders.set(headerName, value)
      }
    }
    if (!responseHeaders.get("cache-control") && options?.fallbackCacheControl) {
      responseHeaders.set("cache-control", options.fallbackCacheControl)
    }

    return NextResponse.json(data, { headers: responseHeaders })
  } catch (error) {
    return handleApiError(error, errorMessage, consoleContext)
  }
}

/**
 * Helper to extract and await params in Next.js 15+ dynamic routes.
 * Validates the value to prevent path traversal attacks.
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
    return sanitizeRouteParam(resolvedParams[key], key)
  }
  
  // Handle older Next.js versions or direct object params
  if (typeof params === 'object') {
    return sanitizeRouteParam(params[key], key)
  }
  
  throw new Error(`Route parameter '${key}' is missing`)
}

/**
 * Rejects values that could be used for path traversal (e.g. "../../admin").
 * Allows alphanumerics, hyphens, underscores, and dots (for course codes like "EECS1001").
 */
function sanitizeRouteParam(value: string, key: string): string {
  if (!value || typeof value !== 'string') {
    throw new Error(`Route parameter '${key}' is missing`)
  }
  // Block path separators and encoded variants
  if (/[\/\\]|%2[Ff]|%5[Cc]|\.\./i.test(value)) {
    throw new Error(`Route parameter '${key}' contains invalid characters`)
  }
  return value
}
