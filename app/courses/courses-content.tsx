"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  X,
  SlidersHorizontal,
} from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import {
  coursesApi,
  formatCourseCode,
  getFacultyName,
  Course,
} from "@/lib/api/courses"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

// Map UI faculty IDs to API faculty codes
const FACULTY_CODE_MAP: Record<string, string> = {
  all: "",
  lassonde: "LE",
  "liberal-arts": "AP",
  science: "SC",
  health: "HH",
  education: "ED",
  "fine-arts": "FA",
  glendon: "GL",
  osgoode: "LW",
  schulich: "SB",
  "environmental-urban": "EU",
  "graduate-studies": "GS",
}

// Map course level IDs to API course_code_range values
const COURSE_LEVEL_TO_RANGE: Record<string, string> = {
  "1xxx": "1000s",
  "2xxx": "2000s",
  "3xxx": "3000s",
  "4xxx": "4000s",
  "5xxx": "5000s",
  "6xxx": "6000s",
  "7xxx": "7000s",
  "8xxx": "8000s",
  "9xxx": "9000s",
}

export default function CoursesContent() {
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedFaculty, setSelectedFaculty] = useState("all")
  const [selectedCourseLevel, setSelectedCourseLevel] = useState<string[]>([])
  const [isFacultyExpanded, setIsFacultyExpanded] = useState(true)
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [isSearchMode, setIsSearchMode] = useState(false)
  const coursesPerPage = 20

  const normalizeCourseCodeKey = (code: string) =>
    code.replace(/\s+/g, "").toUpperCase()

  const dedupeCoursesByCode = (items: Course[]) => {
    const seen = new Set<string>()
    const out: Course[] = []
    for (const c of items) {
      const key = normalizeCourseCodeKey(c.code || "")
      if (!key || seen.has(key)) continue
      seen.add(key)
      out.push(c)
    }
    return out
  }

  const faculties = [
    { id: "all", name: "All Faculties" },
    { id: "lassonde", name: "Lassonde School of Engineering" },
    { id: "liberal-arts", name: "Liberal Arts & Professional Studies" },
    { id: "science", name: "Science" },
    { id: "health", name: "Health" },
    { id: "education", name: "Education" },
    {
      id: "fine-arts",
      name: "School of the Arts, Media, Performance & Design",
    },
    { id: "glendon", name: "Glendon Campus" },
    { id: "osgoode", name: "Osgoode Hall Law School" },
    { id: "schulich", name: "Schulich School of Business" },
    { id: "environmental-urban", name: "Environmental and Urban Change" },
    { id: "graduate-studies", name: "Graduate Studies" },
  ]

  const courseLevels = [
    { id: "1xxx", label: "1000s", range: [1000, 1999] },
    { id: "2xxx", label: "2000s", range: [2000, 2999] },
    { id: "3xxx", label: "3000s", range: [3000, 3999] },
    { id: "4xxx", label: "4000s", range: [4000, 4999] },
    { id: "5xxx", label: "5000s", range: [5000, 5999] },
    { id: "6xxx", label: "6000s", range: [6000, 6999] },
    { id: "7xxx", label: "7000s", range: [7000, 7999] },
    { id: "8xxx", label: "8000s", range: [8000, 8999] },
    { id: "9xxx", label: "9000s", range: [9000, 9999] },
  ]

  const toggleCourseLevel = (levelId: string) => {
    setSelectedCourseLevel((prev) =>
      prev.includes(levelId)
        ? prev.filter((id) => id !== levelId)
        : [...prev, levelId],
    )
  }

  // Handle search functionality
  useEffect(() => {
    // Skip on initial mount when searchQuery is empty
    if (searchQuery.trim().length === 0) {
      setIsSearchMode(false)
      return
    }

    const delaySearch = setTimeout(async () => {
      setIsSearchMode(true)
      setIsSearching(true)
      setIsLoading(true)
      setError(null)
      try {
        const results = await coursesApi.searchCourses(searchQuery)
        const deduped = Array.isArray(results) ? dedupeCoursesByCode(results) : []
        setCourses(deduped)
        setTotalItems(deduped.length)
        setTotalPages(1) // Search results don't use pagination
      } catch (err) {
        console.error("Search failed:", err)
        setError(err instanceof Error ? err.message : "Search failed")
        setCourses([])
        setTotalItems(0)
      } finally {
        setIsSearching(false)
        setIsLoading(false)
      }
    }, 300) // 300ms debounce

    return () => clearTimeout(delaySearch)
  }, [searchQuery])

  // Reset to page 1 when filters change (only if not in search mode)
  useEffect(() => {
    if (!isSearchMode) {
      setCurrentPage(1)
    }
  }, [selectedFaculty, selectedCourseLevel, isSearchMode])

  // Fetch courses from API (only when not in search mode)
  useEffect(() => {
    if (isSearchMode) {
      return // Don't fetch paginated courses when searching
    }
    const fetchCourses = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const params: {
          page: number
          page_size: number
          faculty?: string
          course_code_range?: string
        } = {
          page: currentPage,
          page_size: coursesPerPage,
        }

        // Add faculty filter if not "all"
        if (selectedFaculty !== "all") {
          const facultyCode = FACULTY_CODE_MAP[selectedFaculty]
          if (facultyCode) {
            params.faculty = facultyCode
          }
        }

        // Add course code range filter if selected
        // Note: API only supports one range at a time, so we'll use the first selected
        if (selectedCourseLevel.length > 0) {
          const firstLevel = selectedCourseLevel[0]
          const range = COURSE_LEVEL_TO_RANGE[firstLevel]
          if (range) {
            params.course_code_range = range
          }
        }

        const response = await coursesApi.getPaginatedCourses(params)

        if (response && response.data && Array.isArray(response.data)) {
          // Create a new array reference to ensure React detects the change
          const newCourses = dedupeCoursesByCode([...response.data])
          setCourses(newCourses)
          setTotalPages(response.total_pages)
          setTotalItems(response.total_items)
        } else {
          console.error("Invalid response structure:", response)
          setCourses([])
          setError("Invalid response from server")
        }
      } catch (err) {
        console.error("Error fetching courses:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch courses")
        setCourses([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchCourses()
  }, [currentPage, selectedFaculty, selectedCourseLevel, isSearchMode])

  const clearAllFilters = () => {
    setSelectedFaculty("all")
    setSelectedCourseLevel([])
    setSearchQuery("")
  }

  // Format course code for display
  const formatCode = (code: string) => {
    return formatCourseCode(code)
  }

  // Get course terms from the course object
  const getPaginationRange = () => {
    const delta = 2
    const range = []
    const rangeWithDots = []

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...")
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages)
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header subtitle="Course selection, de-cluttered." />

      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-6 sm:mb-8">
            <Link
              href="/"
              className="text-xs sm:text-sm text-muted-foreground hover:text-foreground mb-2 sm:mb-4 inline-block"
            >
              ← Back to home
            </Link>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
              {isSearchMode ? "Search Results" : "All Courses"}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {isLoading || isSearching
                ? "Loading courses..."
                : error
                  ? `Error: ${error}`
                  : isSearchMode
                    ? `Found ${courses.length} course${courses.length !== 1 ? "s" : ""} for "${searchQuery}"`
                    : `Showing ${courses.length} of ${totalItems} courses · Page ${currentPage} of ${totalPages}`}
            </p>
            {/* Debug info - remove in production */}
            {/* {process.env.NODE_ENV === "development" && (
              <div className="text-xs text-muted-foreground mt-2 p-2 bg-muted rounded">
                Debug: Faculty={selectedFaculty}, Level={selectedCourseLevel.join(",")}, Page={currentPage}
              </div>
            )} */}
          </div>

          <div className="flex gap-4 lg:gap-8">
            {/* Main Content - Left Side */}
            <div className="flex-1 min-w-0">
              {/* Search + Mobile Filter Button */}
              <div className="mb-6 flex gap-2 sm:gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 sm:h-5 w-4 sm:w-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search courses..."
                    className="pl-9 sm:pl-12 pr-8 sm:pr-10 h-10 sm:h-12 bg-card text-sm sm:text-base"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery("")
                        setIsSearchMode(false)
                      }}
                      className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                      aria-label="Clear search"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
                  className="lg:hidden h-10 sm:h-12 w-10 sm:w-12 shrink-0"
                  aria-label="Toggle filters"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </div>

              {/* Mobile Filter Panel */}
              {isMobileFilterOpen && (
                <Card className="p-4 sm:p-6 mb-6 lg:hidden">
                  <h2 className="font-semibold text-base sm:text-lg mb-4">
                    Filter your results
                  </h2>

                  {/* Course Code Level Filter */}
                  <div className="mb-6 pb-6 border-b">
                    <label className="text-xs sm:text-sm font-medium block mb-3">
                      Course code
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {courseLevels.map((level) => (
                        <Button
                          key={level.id}
                          size="sm"
                          variant={
                            selectedCourseLevel.includes(level.id)
                              ? "default"
                              : "outline"
                          }
                          onClick={() => toggleCourseLevel(level.id)}
                          className="rounded-full text-xs sm:text-sm"
                        >
                          {level.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Faculty Filter - Collapsible */}
                  <div className="mb-6">
                    <button
                      onClick={() => setIsFacultyExpanded(!isFacultyExpanded)}
                      className="w-full flex items-center justify-between text-xs sm:text-sm font-medium mb-3 hover:text-primary transition-colors"
                    >
                      <span>Faculty</span>
                      {isFacultyExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                    <div
                      className={`space-y-2 ${isFacultyExpanded ? "block" : "hidden"}`}
                    >
                      {faculties.map((faculty) => (
                        <button
                          key={faculty.id}
                          onClick={() => setSelectedFaculty(faculty.id)}
                          className={`w-full text-left px-3 py-2 rounded-md text-xs sm:text-sm transition-colors ${
                            selectedFaculty === faculty.id
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-accent"
                          }`}
                        >
                          {faculty.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Clear Filter Button */}
                  {(selectedFaculty !== "all" ||
                    selectedCourseLevel.length > 0) && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={clearAllFilters}
                      className="w-full text-xs sm:text-sm"
                    >
                      × Clear filter
                    </Button>
                  )}
                </Card>
              )}

              {isLoading ? (
                <div className="flex flex-col gap-4 sm:gap-6 mb-8">
                  {[...Array(5)].map((_, i) => (
                    <Card key={i} className="p-4 sm:p-6">
                      <div className="h-16 sm:h-24 bg-muted animate-pulse rounded" />
                    </Card>
                  ))}
                </div>
              ) : error ? (
                <Card className="p-4 sm:p-6 mb-8">
                  <div className="text-center py-6 sm:py-8">
                    <p className="text-sm sm:text-base text-destructive mb-4">
                      {error}
                    </p>
                    <Button onClick={() => window.location.reload()} size="sm">
                      Retry
                    </Button>
                  </div>
                </Card>
              ) : courses.length === 0 && !isLoading ? (
                <Card className="p-4 sm:p-6 mb-8">
                  <div className="text-center py-6 sm:py-8">
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {isSearchMode
                        ? `No courses found for "${searchQuery}". Try a different search term.`
                        : "No courses found matching your filters."}
                    </p>
                  </div>
                </Card>
              ) : (
                <div className="flex flex-col gap-4 sm:gap-6 mb-8">
                  {courses.map((course, index) => {
                    const courseCode = formatCode(course.code)
                    const uniqueKey = `${course.id || course.code}-${course.term || ""}-${index}`
                    return (
                      <Link
                        key={uniqueKey}
                        href={`/course/${course.code?.replace(/\s+/g, "").toLowerCase()}`}
                      >
                        <Card className="p-4 sm:p-6 hover:shadow-md transition-all hover:border-primary/50 cursor-pointer group">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                                <h3 className="font-bold text-base sm:text-lg md:text-xl group-hover:text-primary transition-colors break-words">
                                  {courseCode}
                                </h3>
                                <Badge
                                  variant="secondary"
                                  className="text-xs sm:text-sm w-fit"
                                >
                                  {course.credits || "N/A"} credits
                                </Badge>
                              </div>
                              <p className="text-sm sm:text-base font-medium text-foreground mb-2 sm:mb-3 line-clamp-2">
                                {course.name}
                              </p>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                                {course.instructor && (
                                  <span className="line-clamp-1">
                                    {course.instructor}
                                  </span>
                                )}
                                {course.faculty && (
                                  <span className="text-xs hidden sm:inline">
                                    {getFacultyName(course.faculty)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="group-hover:bg-primary group-hover:text-primary-foreground shrink-0 w-full sm:w-auto text-xs sm:text-sm shadow-md hover:shadow-lg border-2 sm:border-2"
                            >
                              View Details
                            </Button>
                          </div>
                        </Card>
                      </Link>
                    )
                  })}
                </div>
              )}

              {/* Pagination */}
              {!isLoading && !error && !isSearchMode && totalPages > 1 && (
                <div className="flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1 || isLoading}
                    className="h-8 sm:h-9 w-8 sm:w-9 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  {getPaginationRange().map((page, idx) =>
                    page === "..." ? (
                      <span
                        key={`dots-${idx}`}
                        className="px-1 sm:px-2 text-xs sm:text-sm text-muted-foreground"
                      >
                        ...
                      </span>
                    ) : (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page as number)}
                        disabled={isLoading}
                        className="min-w-[2rem] sm:min-w-[2.5rem] h-8 sm:h-9 text-xs sm:text-sm"
                      >
                        {page}
                      </Button>
                    ),
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages || isLoading}
                    className="h-8 sm:h-9 w-8 sm:w-9 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <aside className="hidden lg:block w-80 shrink-0">
              <div className="sticky top-24">
                <Card className="p-4 sm:p-6">
                  <h2 className="font-semibold text-base sm:text-lg mb-4 sm:mb-6">
                    Filter your results
                  </h2>

                  {/* Course Code Level Filter */}
                  <div className="mb-6 pb-6 border-b">
                    <label className="text-xs sm:text-sm font-medium block mb-3">
                      Course code
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {courseLevels.map((level) => (
                        <Button
                          key={level.id}
                          size="sm"
                          variant={
                            selectedCourseLevel.includes(level.id)
                              ? "default"
                              : "outline"
                          }
                          onClick={() => toggleCourseLevel(level.id)}
                          className="rounded-full text-xs sm:text-sm"
                        >
                          {level.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Faculty Filter - Collapsible */}
                  <div className="mb-6">
                    <button
                      onClick={() => setIsFacultyExpanded(!isFacultyExpanded)}
                      className="w-full flex items-center justify-between text-xs sm:text-sm font-medium mb-3 hover:text-primary transition-colors"
                    >
                      <span>Faculty</span>
                      {isFacultyExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                    <div
                      className={`space-y-2 ${isFacultyExpanded ? "block" : "hidden"}`}
                    >
                      {faculties.map((faculty) => (
                        <button
                          key={faculty.id}
                          onClick={() => setSelectedFaculty(faculty.id)}
                          className={`w-full text-left px-3 py-2 rounded-md text-xs sm:text-sm transition-colors ${
                            selectedFaculty === faculty.id
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-accent"
                          }`}
                        >
                          {faculty.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Clear Filter Button */}
                  {(selectedFaculty !== "all" ||
                    selectedCourseLevel.length > 0) && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={clearAllFilters}
                      className="w-full text-xs sm:text-sm"
                    >
                      × Clear filter
                    </Button>
                  )}
                </Card>
              </div>
            </aside>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
