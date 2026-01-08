import { NextResponse } from "next/server"

export const API_URL = process.env.API_URL || "http://localhost:8080/api/v1"

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
  const url = `${API_URL}${endpoint}`
  const response = await fetch(url, {
    cache: "no-store",
    ...options,
  })

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`)
  }

  return response
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
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return handleApiError(error, errorMessage, consoleContext)
  }
}

/**
 * Helper to extract and await params in Next.js 15+ dynamic routes
 */
export async function getRouteParam(
  params: Promise<Record<string, string>>,
  key: string
): Promise<string> {
  const resolvedParams = await params
  return resolvedParams[key]
}
