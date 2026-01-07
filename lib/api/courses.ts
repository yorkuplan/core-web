import { apiClient } from "./client"

const DAY_MAP: Record<string, string> = {
  M: "Monday",
  T: "Tuesday",
  W: "Wednesday",
  R: "Thursday",
  F: "Friday",
}

const FACULTY_MAP: Record<string, string> = {
  AP: "Faculty of Liberal Arts & Professional Studies (AP)",
  ED: "Faculty of Education (ED)",
  EU: "Faculty of Environmental & Urban Change (EU)",
  FA: "School of the Arts, Media, Performance & Design (FA)",
  GL: "Glendon College / Collège universitaire Glendon (GL)",
  GS: "Faculty of Graduate Studies (GS)",
  HH: "Faculty of Health (HH)",
  LE: "Lassonde School of Engineering (LE)",
  SB: "Schulich School of Business (SB)",
  SC: "Faculty of Science (SC)",
}

const TYPE_MAP: Record<string, string> = {
  BLEN: "Blended learning",
  CLIN: "Clinical",
  CORS: "Correspondence",
  DIRD: "Directed reading",
  DISS: "Dissertation",
  FDEX: "Field experience",
  FIEL: "Field trip",
  HYFX: "Hyflex",
  IDS: "Individual directed study",
  INSP: "Internship",
  ISTY: "Independent studies",
  LAB: "Laboratory",
  LECT: "Lecture",
  LGCL: "Language classes",
  ONCA: "Online - Campus Assessment",
  ONLN: "Online learning",
  PERF: "Performance",
  PRAC: "Practicum",
  REEV: "Research evaluation",
  REMT: "Remote",
  RESP: "Research paper",
  REVP: "Review paper",
  SEMR: "Seminar",
  STDO: "Studio",
  THES: "Thesis",
  TUTR: "Tutorial",
  WKSP: "Workshop",
}

export const getDayName = (dayCode: string): string => {
  return DAY_MAP[dayCode.toUpperCase()] || dayCode
}

export const getFacultyName = (facultyCode: string): string => {
  return FACULTY_MAP[facultyCode.toUpperCase()] || facultyCode
}

export const getTypeName = (typeCode: string): string => {
  return TYPE_MAP[typeCode.toUpperCase()] || typeCode
}

export const calculateEndTime = (
  startTime: string,
  durationMinutes: string
): string => {
  try {
    const duration = parseInt(durationMinutes, 10)
    const [hours, minutes] = startTime.split(":").map(Number)

    const startTotalMinutes = hours * 60 + minutes
    const endTotalMinutes = startTotalMinutes + duration

    const endHours = Math.floor(endTotalMinutes / 60)
    const endMinutes = endTotalMinutes % 60

    return `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(
      2,
      "0"
    )}`
  } catch (e) {
    return startTime
  }
}

export const formatTime = (time: string): string => {
  try {
    const [hours, minutes] = time.split(":").map(Number)
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}`
  } catch (e) {
    return time
  }
}

export interface Course {
  id: string
  code: string
  name: string
  instructor: string
  faculty: string
  type: string
  students: number
  sections: number
  credits: number
}

export interface Section {
  id: string
  course_id: string
  letter: string
}

export interface TimeSlot {
  day: string
  time: string
  duration: string
  campus: string
  room: string
}

export interface Instructor {
  id: string
  first_name: string
  last_name: string
  rate_my_prof_link: string
  section_id: string
}

interface CoursesResponse {
  data?: Course[]
  courses?: Course[]
  [key: string]: any
}

interface SectionsResponse {
  data?: Section[]
  sections?: Section[]
  [key: string]: any
}

interface InstructorsResponse {
  data?: Instructor[]
  instructors?: Instructor[]
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

  async searchCourses(query: string): Promise<Course[]> {
    const response = await apiClient.get<CoursesResponse | Course[]>(
      `/courses/search?q=${encodeURIComponent(query)}`
    )

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

  async getCourseById(id: string): Promise<Course> {
    const response = await apiClient.get<CoursesResponse | Course>(
      `/courses/${id}`
    )

    // Check if response is directly a Course object
    if (
      response &&
      typeof response === "object" &&
      "id" in response &&
      "code" in response
    ) {
      return response as Course
    }

    // Check if response is wrapped in data property
    if (response && typeof response === "object" && "data" in response) {
      const data = (response as any).data
      if (data && typeof data === "object" && "id" in data) {
        return data as Course
      }
    }

    // Check if response is wrapped in course property
    if (response && typeof response === "object" && "course" in response) {
      const course = (response as any).course
      if (course && typeof course === "object" && "id" in course) {
        return course as Course
      }
    }

    console.error("Unexpected API response structure:", response)
    throw new Error("Invalid API response structure")
  },

  async getSectionsByCourseId(courseId: string): Promise<Section[]> {
    const response = await apiClient.get<SectionsResponse | Section[]>(
      `/sections/${courseId}`
    )

    if (Array.isArray(response)) {
      return response
    }

    if (response.data && Array.isArray(response.data)) {
      return response.data
    }

    if (response.sections && Array.isArray(response.sections)) {
      return response.sections
    }

    console.error("Unexpected API response structure:", response)
    throw new Error("Invalid API response structure")
  },

  async getInstructorsByCourseId(courseId: string): Promise<Instructor[]> {
    const response = await apiClient.get<InstructorsResponse | Instructor[]>(
      `/instructors/${courseId}`
    )

    if (Array.isArray(response)) {
      return response
    }

    if (response.data && Array.isArray(response.data)) {
      return response.data
    }

    if (response.instructors && Array.isArray(response.instructors)) {
      return response.instructors
    }

    console.error("Unexpected API response structure:", response)
    throw new Error("Invalid API response structure")
  },
}
