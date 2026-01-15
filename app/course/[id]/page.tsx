"use client"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  Users,
  BookOpen,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react"
import Link from "next/link"
import {
  coursesApi,
  type Course,
  type Section,
  type Instructor,
  getDayName,
  getFacultyName,
  getTypeName,
  calculateEndTime,
  formatTime,
  getSemesterName,
  formatCourseCode,
} from "@/lib/api/courses"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function CoursePage() {
  const params = useParams()
  const courseId = getIDFromParams({ id: params.id as string })
  const [course, setCourse] = useState<Course | null>(null)
  const [sections, setSections] = useState<Section[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [instructorsBySection, setInstructorsBySection] = useState<
    Record<string, Instructor>
  >({})
  const [copiedCatalog, setCopiedCatalog] = useState<string | null>(null)

  const parseCatalogNumbers = (catalogNumber: string): string[] => {
    if (!catalogNumber) return []

    // Pattern to match catalog numbers like "K28B01 (HH NRSC)" or "D75K01 (SC NRSC)"
    // This regex matches: alphanumeric code, optional space, (faculty info), followed by space or end
    const catalogPattern = /([A-Z0-9]+)\s*\([^)]+\)/g
    const matches: string[] = []
    let match

    // Reset regex lastIndex to ensure we start from the beginning
    catalogPattern.lastIndex = 0

    while ((match = catalogPattern.exec(catalogNumber)) !== null) {
      matches.push(match[0].trim())
    }

    if (matches.length > 1) {
      return matches
    }

    // If no pattern matches, try splitting by multiple spaces (2+ spaces)
    const parts = catalogNumber.split(/\s{2,}/).filter(Boolean)
    if (parts.length > 1) {
      return parts.map((p) => p.trim())
    }

    // Fallback: return as single item
    return [catalogNumber.trim()]
  }

  const handleCopyCatalog = async (catalogNumber: string) => {
    try {
      // Try modern Clipboard API first
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(catalogNumber)
        setCopiedCatalog(catalogNumber)
        setTimeout(() => setCopiedCatalog(null), 2000)
        return
      }

      // Fallback for older browsers and Safari
      const textArea = document.createElement("textarea")
      textArea.value = catalogNumber
      textArea.style.position = "fixed"
      textArea.style.left = "-999999px"
      textArea.style.top = "-999999px"
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()

      const successful = document.execCommand("copy")
      document.body.removeChild(textArea)

      if (successful) {
        setCopiedCatalog(catalogNumber)
        setTimeout(() => setCopiedCatalog(null), 2000)
      } else {
        throw new Error("execCommand copy failed")
      }
    } catch (err) {
      console.error("Failed to copy catalog number to clipboard:", err)
      if (typeof window !== "undefined" && typeof window.alert === "function") {
        window.alert("Failed to copy to clipboard. Please try again.")
      }
    }
  }
  useEffect(() => {
    async function fetchCourseData() {
      try {
        setIsLoading(true)
        const [courseData, sectionsData, instructorsData] = await Promise.all([
          coursesApi.getCourseById(courseId),
          coursesApi.getSectionsByCourseId(courseId),
          coursesApi.getInstructorsByCourseId(courseId),
        ])
        setCourse(courseData)
        setSections(sectionsData)
        // Map instructors to their sections
        const instructorsMap: Record<string, Instructor> = {}
        instructorsData.forEach((instructor) => {
          instructorsMap[instructor.section_id] = instructor
        })
        setInstructorsBySection(instructorsMap)
      } catch (err) {
        console.error("Failed to fetch course data:", err)
        setError("Failed to load course. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCourseData()
  }, [courseId])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header subtitle="Course selection, de-cluttered." />

      <div className="container mx-auto px-4 py-8 flex-grow">
        {isLoading ? (
          <div className="max-w-6xl mx-auto text-center py-12">
            <p className="text-muted-foreground">Loading course...</p>
          </div>
        ) : error || !course ? (
          <div className="max-w-6xl mx-auto text-center py-12">
            <p className="text-destructive">{error || "Course not found"}</p>
            <Link
              href="/"
              className="text-primary hover:underline mt-4 inline-block"
            >
              ← Back to search
            </Link>
          </div>
        ) : (
          <>
            {/* Course Header */}
            <div className="max-w-6xl mx-auto mb-8">
              <Link
                href="/"
                className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block"
              >
                ← Back to search
              </Link>

              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h1 className="text-5xl font-bold mb-3">
                    {formatCourseCode(course.code)}
                  </h1>
                  <p className="text-2xl text-muted-foreground mb-4">
                    {course.name}
                  </p>
                </div>
                <Badge variant="secondary" className="text-base px-4 py-2">
                  {course.credits} credit
                  {course.credits === 1 ? "" : "s"}
                </Badge>
              </div>

              <Card className="p-8 bg-muted/30">
                <p className="text-base text-foreground leading-relaxed">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco
                  laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                  irure dolor in reprehenderit in voluptate velit esse cillum
                  dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                  cupidatat non proident, sunt in culpa qui officia deserunt
                  mollit anim id est laborum.
                </p>
              </Card>

              <div className="flex flex-wrap items-center gap-6 mt-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" aria-hidden="true" />
                  <span>{getSemesterName(course.term)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" aria-hidden="true" />
                  <span>
                    {sections.length}{" "}
                    {sections.length === 1 ? "section" : "sections"} available
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" aria-hidden="true" />
                  <span>{getFacultyName(course.faculty)}</span>
                </div>
              </div>
            </div>

            {/* Sections */}
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">Available Sections</h2>

              {sections.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No sections available for this course.
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sections.map((section) => {
                    // Check if any activity has multiple catalog numbers
                    const hasMultipleCatalogs =
                      section.activities?.some(
                        (activity) =>
                          activity.catalog_number &&
                          parseCatalogNumbers(activity.catalog_number).length >
                            1
                      ) || false

                    return (
                      <Card
                        key={section.id}
                        className={`p-5 hover:shadow-lg transition-all hover:border-primary/50 ${
                          hasMultipleCatalogs
                            ? "md:col-span-2 lg:col-span-2"
                            : ""
                        }`}
                      >
                        <div className="mb-4">
                          <h3 className="text-2xl font-bold">
                            Section {section.letter}
                          </h3>
                          {instructorsBySection[section.id] ? (
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm text-muted-foreground">
                                {instructorsBySection[section.id].first_name}{" "}
                                {instructorsBySection[section.id].last_name}
                              </p>
                              {instructorsBySection[section.id]
                                .rate_my_prof_link && (
                                <a
                                  href={
                                    instructorsBySection[section.id]
                                      .rate_my_prof_link
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 px-2 py-1 rounded bg-primary/10 hover:bg-primary/20 transition-colors group whitespace-nowrap flex-shrink-0"
                                  title="View on Rate My Professors"
                                  aria-label={`View ${
                                    instructorsBySection[section.id].first_name
                                  } ${
                                    instructorsBySection[section.id].last_name
                                  } on Rate My Professors`}
                                >
                                  <span className="text-xs font-medium text-primary">
                                    ratemyprof/
                                    {instructorsBySection[
                                      section.id
                                    ].last_name.toLowerCase()}
                                  </span>
                                  <ExternalLink className="h-3 w-3 text-primary" />
                                </a>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              No instructor assigned yet
                            </p>
                          )}
                        </div>

                        <div className="space-y-3 mb-4">
                          {section.activities &&
                          section.activities.length > 0 ? (
                            [...section.activities]
                              .sort((a, b) => {
                                // Lect type comes first
                                if (
                                  a.course_type === "LECT" &&
                                  b.course_type !== "LECT"
                                )
                                  return -1
                                if (
                                  a.course_type !== "LECT" &&
                                  b.course_type === "LECT"
                                )
                                  return 1
                                return 0
                              })
                              .map((activity, idx) => {
                                let times: Array<{
                                  day: string
                                  time: string
                                  duration: string
                                  campus: string
                                  room: string
                                }> = []
                                try {
                                  times = JSON.parse(activity.times)
                                } catch (e) {
                                  times = []
                                }

                                const activityType = getTypeName(
                                  activity.course_type
                                )
                                const activityCount =
                                  section.activities!.filter(
                                    (a) =>
                                      a.course_type === activity.course_type
                                  ).length
                                const isMultiple = activityCount > 1

                                return (
                                  <div
                                    key={activity.id}
                                    className="bg-muted/50 rounded-lg p-3"
                                  >
                                    <div className="flex items-start gap-2 text-xs text-muted-foreground mb-1 min-w-0">
                                      <BookOpen
                                        className="h-3 w-3 flex-shrink-0 mt-0.5"
                                        aria-hidden="true"
                                      />
                                      <span className="flex-shrink-0">
                                        {activityType}
                                        {isMultiple &&
                                          ` ${
                                            section
                                              .activities!.filter(
                                                (a) =>
                                                  a.course_type ===
                                                  activity.course_type
                                              )
                                              .indexOf(activity) + 1
                                          }`}
                                      </span>
                                      {activity.catalog_number && (
                                        <div className="flex flex-wrap gap-1.5 ml-auto flex-shrink min-w-0">
                                          {parseCatalogNumbers(
                                            activity.catalog_number
                                          ).map((catalogNum, idx) => (
                                            <button
                                              key={idx}
                                              onClick={() =>
                                                handleCopyCatalog(
                                                  catalogNum.trim()
                                                )
                                              }
                                              className="flex items-center gap-1 px-2 py-1 rounded bg-primary/10 hover:bg-primary/20 transition-colors group whitespace-nowrap flex-shrink-0"
                                              title="Click to copy catalog number"
                                              aria-label={`Copy catalog number ${catalogNum}`}
                                              type="button"
                                            >
                                              <span className="text-xs font-mono font-medium text-primary">
                                                {catalogNum.trim()}
                                              </span>
                                              {copiedCatalog ===
                                              catalogNum.trim() ? (
                                                <Check className="h-3 w-3 text-primary flex-shrink-0" />
                                              ) : (
                                                <Copy className="h-3 w-3 text-primary opacity-60 group-hover:opacity-100 flex-shrink-0" />
                                              )}
                                            </button>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                    {times.length === 0 ? (
                                      <p className="text-sm font-bold">
                                        Cancelled
                                      </p>
                                    ) : times.length > 0 &&
                                      (!times[0].time ||
                                        times[0].time === "0:00") ? (
                                      <p className="text-sm font-bold">
                                        No Scheduled Times
                                      </p>
                                    ) : (
                                      <>
                                        <p className="text-sm font-medium">
                                          {getDayName(times[0].day)}:{" "}
                                          {formatTime(times[0].time)} -{" "}
                                          {calculateEndTime(
                                            times[0].time,
                                            times[0].duration
                                          )}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          {[times[0]?.room, times[0]?.campus]
                                            .filter(Boolean)
                                            .join(", ")}
                                        </p>
                                      </>
                                    )}
                                  </div>
                                )
                              })
                          ) : (
                            <p className="text-xs text-muted-foreground">
                              No activities scheduled
                            </p>
                          )}
                        </div>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  )
}

function getIDFromParams(params: { id?: string }) {
  const { id } = params
  if (!id || Array.isArray(id)) {
    throw new Error("Invalid or missing course ID")
  }
  return id
}
