import { apiClient } from "./client"

export interface Course {
  code: string
  name: string
  instructor: string
  students: number
  sections: number
  credits: number
}

interface CoursesResponse {
  data?: Course[]
  courses?: Course[]
  [key: string]: any
}

export const coursesApi = {
  async getAllCourses(): Promise<Course[]> {
    const response = await apiClient.get<CoursesResponse | Course[]>("/courses")
    
    if (Array.isArray(response)) {
      return response
    }
    
    if (response.data && Array.isArray(response.data)) {
      return response.data
    }
    
    if (response.courses && Array.isArray(response.courses)) {
      return response.courses
    }
    
    console.error("Unexpected API response structure:", response)
    throw new Error("Invalid API response structure")
  },
}