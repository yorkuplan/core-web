const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  async get<T>(endpoint: string): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error("API Error:", response.status, response.statusText, errorText)
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    return data
  }
}

export const apiClient = new ApiClient(API_URL)