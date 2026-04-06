const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

type ApiGetOptions = {
  cache?: RequestCache
  headers?: HeadersInit
}

class ApiClient {
  private baseUrl: string
  private inFlightGets = new Map<string, Promise<unknown>>()

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  async get<T>(endpoint: string, options: ApiGetOptions = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const cacheMode = options.cache ?? "default"
    const requestKey = `GET:${url}:${cacheMode}`

    const existing = this.inFlightGets.get(requestKey)
    if (existing) {
      return existing as Promise<T>
    }

    // Deduplicate concurrent identical GET requests while still relying on HTTP cache.
    const requestPromise = (async () => {
      const response = await fetch(url, {
        cache: cacheMode,
        headers: options.headers,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("API Error:", response.status, response.statusText, errorText)
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }

      return response.json() as Promise<T>
    })()

    this.inFlightGets.set(requestKey, requestPromise as Promise<unknown>)
    try {
      return await requestPromise
    } finally {
      this.inFlightGets.delete(requestKey)
    }
  }
}

export const apiClient = new ApiClient(API_URL)