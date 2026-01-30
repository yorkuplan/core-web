"use client"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Users,
  BookOpen,
  Copy,
  Check,
  ExternalLink,
  Star,
  MessageSquare,
  Sparkles,
} from "lucide-react"
import Link from "next/link"
import {
  coursesApi,
  type Section,
  type Instructor,
  type CourseOffering,
  type ReviewsResponse,
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
import { BlurredHero } from "@/components/blurred-hero"
import { ReviewStats } from "@/components/review-stats"
import { ReviewsList } from "@/components/reviews-list"
import { ReviewForm } from "@/components/review-form"

const TERM_ORDER: Record<string, number> = {
  F: 1,
  W: 2,
  S: 3,
  Y: 4,
}

const formatTermLabel = (term: string): string => {
  // getSemesterName returns e.g. "Fall (F)" -> prefer "Fall"
  const name = getSemesterName(term)
  return name.replace(/\s*\([^)]+\)\s*$/, "").trim() || term
}

export default function CoursePage() {
  const params = useParams()
  const courseCode = getIDFromParams({ id: params.id as string })
  const [offerings, setOfferings] = useState<CourseOffering[]>([])
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [instructorsBySection, setInstructorsBySection] = useState<
    Record<string, Instructor>
  >({})
  const [copiedCatalog, setCopiedCatalog] = useState<string | null>(null)
  const [reviewsData, setReviewsData] = useState<ReviewsResponse | null>(null)
  const [isLoadingReviews, setIsLoadingReviews] = useState(false)
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false)

  const selectedOffering =
    offerings.find((o) => o.term === selectedTerm) || offerings[0] || null
  const sections: Section[] = selectedOffering?.sections || []

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

  const parseDescription = (
    description: string | undefined,
  ): { description: string; prerequisites: string | null } => {
    if (!description) {
      return { description: "", prerequisites: null }
    }

    // Look for "Prerequisite" or "Prerequisites" (case-insensitive)
    const prerequisiteRegex = /\b(Prerequisite[s]?)\s*:?\s*/i
    const match = description.search(prerequisiteRegex)

    if (match === -1) {
      // No prerequisites found, return full description
      return { description: description.trim(), prerequisites: null }
    }

    // Split at the prerequisite marker
    const mainDescription = description.substring(0, match).trim()
    const prerequisitesText = description.substring(match).trim()

    // Remove the "Prerequisite(s):" prefix from the prerequisites text
    const cleanedPrerequisites = prerequisitesText
      .replace(prerequisiteRegex, "")
      .trim()

    return {
      description: mainDescription,
      prerequisites: cleanedPrerequisites || null,
    }
  }

  const parsePrerequisitesIntoList = (prerequisites: string): string[] => {
    if (!prerequisites) return []

    // Split by semicolons first (common separator for prerequisites)
    const items: string[] = []

    // Handle special sections like "Course credit exclusions:" and "Previously offered as:"
    const sections = prerequisites.split(
      /(?=Course credit exclusions:|Previously offered as:)/i,
    )

    sections.forEach((section) => {
      const trimmed = section.trim()
      if (!trimmed) return

      // Check if this is a special section
      if (
        trimmed.match(/^(Course credit exclusions|Previously offered as):/i)
      ) {
        // Add the section header as a separate item
        const match = trimmed.match(
          /^(Course credit exclusions|Previously offered as):\s*(.+)/i,
        )
        if (match) {
          items.push(`${match[1]}: ${match[2].trim()}`)
        }
      } else {
        // Split by semicolons for regular prerequisites
        const parts = trimmed
          .split(";")
          .map((p) => p.trim())
          .filter((p) => p)
        items.push(...parts)
      }
    })

    return items.filter((item) => item.length > 0)
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
        const data = await coursesApi.getCoursesByCode(courseCode)
        const sorted = [...data].sort((a, b) => {
          const ao = TERM_ORDER[a.term?.toUpperCase?.() || ""] ?? 999
          const bo = TERM_ORDER[b.term?.toUpperCase?.() || ""] ?? 999
          if (ao !== bo) return ao - bo
          return (a.term || "").localeCompare(b.term || "")
        })
        setOfferings(sorted)

        const initialTerm = sorted[0]?.term ?? null
        setSelectedTerm(initialTerm)
      } catch (err) {
        console.error("Failed to fetch course data:", err)
        setError("Failed to load course. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCourseData()
  }, [courseCode])

  useEffect(() => {
    async function fetchInstructors() {
      if (!selectedOffering?.id) return
      try {
        const instructorsData = await coursesApi.getInstructorsByCourseId(
          selectedOffering.id,
        )
        const instructorsMap: Record<string, Instructor> = {}
        instructorsData.forEach((instructor) => {
          instructorsMap[instructor.section_id] = instructor
        })
        setInstructorsBySection(instructorsMap)
      } catch (err) {
        console.error("Failed to fetch instructors:", err)
        setInstructorsBySection({})
      }
    }

    fetchInstructors()
  }, [selectedOffering?.id])

  useEffect(() => {
    async function fetchReviews() {
      try {
        setIsLoadingReviews(true)
        const data = await coursesApi.getReviews(courseCode, {
          sort: "recent",
          limit: 10,
          offset: 0,
        })
        setReviewsData(data)
      } catch (err) {
        console.error("Failed to fetch reviews:", err)
        setReviewsData(null)
      } finally {
        setIsLoadingReviews(false)
      }
    }

    fetchReviews()
  }, [courseCode])

  const refetchReviews = async () => {
    try {
      setIsLoadingReviews(true)
      const data = await coursesApi.getReviews(courseCode, {
        sort: "recent",
        limit: 10,
        offset: 0,
      })
      setReviewsData(data)
    } catch (err) {
      console.error("Failed to fetch reviews:", err)
      setReviewsData(null)
    } finally {
      setIsLoadingReviews(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header subtitle="Course selection, de-cluttered." />

      <div className="flex-grow">
        {isLoading ? (
          <div className="container mx-auto px-3 sm:px-4">
            <div className="max-w-6xl mx-auto text-center py-8 sm:py-12">
              <p className="text-sm sm:text-base text-muted-foreground">
                Loading course...
              </p>
            </div>
          </div>
        ) : error || !selectedOffering ? (
          <div className="container mx-auto px-3 sm:px-4">
            <div className="max-w-6xl mx-auto text-center py-8 sm:py-12">
              <p className="text-sm sm:text-base text-destructive">
                {error || "Course not found"}
              </p>
              <Link
                href="/courses"
                className="text-primary hover:underline mt-4 inline-block"
              >
                ← Back to courses
              </Link>
            </div>
          </div>
        ) : (
          <>
            <BlurredHero
              className="pt-8 sm:pt-12 pb-10 sm:pb-12 md:pb-14"
              priority
            >
              <div className="container mx-auto px-3 sm:px-4">
                {/* Course Header */}
                <div className="max-w-6xl mx-auto">
                  <Link
                    href="/courses"
                    className="text-xs sm:text-sm text-white/80 hover:text-white mb-3 sm:mb-4 inline-flex items-center gap-2"
                  >
                    ← Back to courses
                  </Link>

                  <div className="mb-4 sm:mb-6">
                    <div className="flex items-start justify-between gap-2 sm:gap-4 mb-2 sm:mb-3">
                      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold break-words text-white drop-shadow-sm">
                        {formatCourseCode(selectedOffering.code)}
                      </h1>
                      <Badge className="bg-primary text-primary-foreground text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2 shrink-0 mt-0.5 shadow-md">
                        {selectedOffering.credits}{" "}
                        {selectedOffering.credits === 1 ? "Credit" : "Credits"}
                      </Badge>
                    </div>
                    <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/85 line-clamp-3">
                      {selectedOffering.name}
                    </p>
                  </div>

                  {selectedOffering.description &&
                    (() => {
                      const { description, prerequisites } = parseDescription(
                        selectedOffering.description,
                      )
                      return (
                        <>
                          {description && (
                            <Card className="p-4 sm:p-6 md:p-8 bg-background/85 backdrop-blur-md border-white/30 shadow-xl shadow-black/15">
                              <p className="text-sm sm:text-base text-foreground leading-relaxed whitespace-pre-line">
                                {description}
                              </p>
                            </Card>
                          )}
                          {prerequisites &&
                            (() => {
                              const prerequisiteItems =
                                parsePrerequisitesIntoList(prerequisites)
                              return (
                                <Card className="p-4 sm:p-6 bg-background/85 backdrop-blur-md border-white/30 mt-3 sm:mt-4 shadow-lg shadow-black/10">
                                  <h3 className="text-lg sm:text-xl font-bold text-primary mb-3">
                                    Prerequisites
                                  </h3>
                                  {prerequisiteItems.length > 0 ? (
                                    <ul className="list-disc list-outside space-y-2 text-sm sm:text-base text-foreground leading-relaxed pl-6 sm:pl-7">
                                      {prerequisiteItems.map((item, index) => (
                                        <li key={index}>{item}</li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <p className="text-sm sm:text-base text-foreground leading-relaxed whitespace-pre-line">
                                      {prerequisites}
                                    </p>
                                  )}
                                </Card>
                              )
                            })()}
                        </>
                      )
                    })()}
                </div>
              </div>
            </BlurredHero>

            {/* Sections */}
            <section className="container mx-auto px-3 sm:px-4 py-6 sm:py-10">
              <div className="max-w-6xl mx-auto">
                <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-2xl sm:text-3xl font-bold">
                      Available Sections
                    </h2>

                    {/* Term selector (right side) */}
                    <div className="flex sm:justify-end">
                      <div
                        className="inline-flex w-fit items-center gap-2 bg-muted rounded-lg p-1"
                        role="tablist"
                        aria-label="Select term"
                      >
                        {offerings.map((o) => {
                          const isActive = o.term === selectedTerm
                          return (
                            <button
                              key={o.id}
                              type="button"
                              onClick={() => setSelectedTerm(o.term)}
                              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                isActive
                                  ? "bg-background text-foreground shadow-sm"
                                  : "text-muted-foreground hover:text-foreground"
                              }`}
                              aria-pressed={isActive}
                              aria-current={isActive ? "true" : undefined}
                            >
                              {formatTermLabel(o.term)}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Users
                        className="h-3 sm:h-4 w-3 sm:w-4 flex-shrink-0"
                        aria-hidden="true"
                      />
                      <span>
                        {sections.length}{" "}
                        {sections.length === 1 ? "section" : "sections"}{" "}
                        available
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen
                        className="h-3 sm:h-4 w-3 sm:w-4 flex-shrink-0"
                        aria-hidden="true"
                      />
                      <span>{getFacultyName(selectedOffering.faculty)}</span>
                    </div>
                  </div>
                </div>

                {sections.length === 0 ? (
                  <div className="text-center py-8 sm:py-12 text-sm sm:text-base text-muted-foreground">
                    No sections available for this course.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4">
                    {sections.map((section) => {
                      return (
                        <Card
                          key={section.id}
                          className="w-full p-4 sm:p-6 hover:shadow-lg transition-all hover:border-primary/50"
                        >
                          <div className="mb-4">
                            <h3 className="text-xl sm:text-2xl font-bold">
                              Section {section.letter}
                            </h3>
                            {instructorsBySection[section.id] ? (
                              <div className="flex items-center justify-between gap-2 mt-1">
                                <p className="text-xs sm:text-sm text-muted-foreground">
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
                                    className="flex items-center gap-1 px-2 py-1 rounded bg-primary/10 hover:bg-primary/20 transition-colors group whitespace-nowrap flex-shrink-0 text-xs"
                                    title="View on Rate My Professors"
                                    aria-label={`View ${
                                      instructorsBySection[section.id]
                                        .first_name
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
                              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
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
                                .map((activity) => {
                                  let times: Array<{
                                    day: string
                                    time: string
                                    duration: string
                                    campus: string
                                    room: string
                                  }> = []
                                  try {
                                    times = JSON.parse(activity.times)
                                  } catch {
                                    times = []
                                  }

                                  const activityType = getTypeName(
                                    activity.course_type,
                                  )
                                  const activityCount =
                                    section.activities!.filter(
                                      (a) =>
                                        a.course_type === activity.course_type,
                                    ).length
                                  const isMultiple = activityCount > 1

                                  const catalogNumbers = activity.catalog_number
                                    ? parseCatalogNumbers(
                                        activity.catalog_number,
                                      )
                                    : []
                                  const hasSingleCatalog =
                                    catalogNumbers.length === 1

                                  return (
                                    <div
                                      key={activity.id}
                                      className="bg-muted/50 rounded-lg p-3 sm:p-4"
                                    >
                                      <div
                                        className={`flex items-start gap-2 mb-2 ${hasSingleCatalog ? "" : "justify-between"}`}
                                      >
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-1 min-w-0">
                                          <BookOpen
                                            className="h-3 w-3 flex-shrink-0"
                                            aria-hidden="true"
                                          />
                                          <span className="flex-shrink-0 whitespace-nowrap">
                                            {activityType}
                                            {isMultiple &&
                                              ` ${
                                                section
                                                  .activities!.filter(
                                                    (a) =>
                                                      a.course_type ===
                                                      activity.course_type,
                                                  )
                                                  .indexOf(activity) + 1
                                              }`}
                                          </span>
                                          {hasSingleCatalog && (
                                            <button
                                              onClick={() =>
                                                handleCopyCatalog(
                                                  catalogNumbers[0].trim(),
                                                )
                                              }
                                              className="flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded bg-primary/10 hover:bg-primary/20 transition-colors group whitespace-nowrap shrink-0 text-xs ml-auto"
                                              title="Click to copy catalog number"
                                              aria-label={`Copy catalog number ${catalogNumbers[0]}`}
                                              type="button"
                                            >
                                              <span className="text-xs font-mono font-medium text-primary line-clamp-1">
                                                {catalogNumbers[0].trim()}
                                              </span>
                                              {copiedCatalog ===
                                              catalogNumbers[0].trim() ? (
                                                <Check className="h-3 w-3 text-primary flex-shrink-0" />
                                              ) : (
                                                <Copy className="h-3 w-3 text-primary opacity-60 group-hover:opacity-100 flex-shrink-0" />
                                              )}
                                            </button>
                                          )}
                                        </div>
                                        {!hasSingleCatalog &&
                                          activity.catalog_number && (
                                            <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1.5 items-end sm:justify-items-end">
                                              {catalogNumbers.map(
                                                (catalogNum, idx) => (
                                                  <button
                                                    key={idx}
                                                    onClick={() =>
                                                      handleCopyCatalog(
                                                        catalogNum.trim(),
                                                      )
                                                    }
                                                    className="flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded bg-primary/10 hover:bg-primary/20 transition-colors group whitespace-nowrap shrink-0 text-xs"
                                                    title="Click to copy catalog number"
                                                    aria-label={`Copy catalog number ${catalogNum}`}
                                                    type="button"
                                                  >
                                                    <span className="text-xs font-mono font-medium text-primary line-clamp-1">
                                                      {catalogNum.trim()}
                                                    </span>
                                                    {copiedCatalog ===
                                                    catalogNum.trim() ? (
                                                      <Check className="h-3 w-3 text-primary flex-shrink-0" />
                                                    ) : (
                                                      <Copy className="h-3 w-3 text-primary opacity-60 group-hover:opacity-100 flex-shrink-0" />
                                                    )}
                                                  </button>
                                                ),
                                              )}
                                            </div>
                                          )}
                                      </div>
                                      {times.length === 0 ? (
                                        <p className="text-xs sm:text-sm font-bold">
                                          Cancelled
                                        </p>
                                      ) : times.length > 0 &&
                                        (!times[0].time ||
                                          times[0].time === "0:00") ? (
                                        <p className="text-xs sm:text-sm font-bold">
                                          No Scheduled Times
                                        </p>
                                      ) : (
                                        <>
                                          <p className="text-xs sm:text-sm font-medium">
                                            {getDayName(times[0].day)}:{" "}
                                            {formatTime(times[0].time)} -{" "}
                                            {calculateEndTime(
                                              times[0].time,
                                              times[0].duration,
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
                              <p className="text-xs text-muted-foreground mt-1">
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
            </section>

            {/* Reviews Section */}
            <section className="container mx-auto px-3 sm:px-4 py-6 sm:py-10">
              <div className="max-w-6xl mx-auto">
                <div className="mb-4 sm:mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">
                      Reviews
                    </h2>
                    {reviewsData && reviewsData.stats.total_reviews > 0 && (
                      <Button
                        onClick={() => setIsReviewFormOpen(true)}
                        size="sm"
                        className="shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all bg-linear-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary group"
                      >
                        <MessageSquare
                          className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 group-hover:scale-110 transition-transform"
                          aria-hidden="true"
                        />
                        <span className="text-xs sm:text-sm">Add review</span>
                      </Button>
                    )}
                  </div>
                </div>

                {isLoadingReviews ? (
                  <Card className="p-8 sm:p-12 text-center border-dashed">
                    <div className="flex flex-col items-center gap-3 sm:gap-4">
                      <div className="animate-pulse">
                        <Star
                          className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/50"
                          aria-hidden="true"
                        />
                      </div>
                      <p className="text-sm sm:text-base text-muted-foreground">
                        Loading reviews...
                      </p>
                    </div>
                  </Card>
                ) : reviewsData && reviewsData.stats.total_reviews > 0 ? (
                  <>
                    <ReviewStats stats={reviewsData.stats} />
                    <ReviewsList reviews={reviewsData.data} />
                  </>
                ) : (
                  <Card className="relative overflow-hidden border-2 border-dashed border-primary/30 bg-linear-to-br from-background via-primary/5 to-background">
                    <div
                      className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"
                      aria-hidden="true"
                    />
                    <div
                      className="absolute bottom-0 left-0 w-48 h-48 sm:w-64 sm:h-64 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"
                      aria-hidden="true"
                    />
                    <div className="relative p-8 sm:p-12 md:p-16 text-center">
                      <div className="flex justify-center mb-4 sm:mb-6">
                        <div className="relative">
                          <div
                            className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"
                            aria-hidden="true"
                          />
                          <div className="relative p-3 sm:p-4 bg-background border-2 border-primary/30 rounded-full">
                            <MessageSquare
                              className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 text-primary"
                              aria-hidden="true"
                            />
                          </div>
                        </div>
                      </div>
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        No reviews yet
                      </h3>
                      <p className="text-xs sm:text-sm md:text-base text-muted-foreground mb-4 sm:mb-6 max-w-md mx-auto px-4">
                        Be the first to share your experience and help future
                        students make informed decisions!
                      </p>
                      <Button
                        onClick={() => setIsReviewFormOpen(true)}
                        size="lg"
                        className="w-full sm:w-auto shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all bg-linear-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary group"
                      >
                        <Sparkles
                          className="h-4 w-4 sm:h-5 sm:w-5 mr-2 group-hover:rotate-12 transition-transform"
                          aria-hidden="true"
                        />
                        Write the first review
                      </Button>
                    </div>
                  </Card>
                )}
              </div>
            </section>
          </>
        )}
      </div>

      <Footer />

      {/* Review Form Dialog */}
      {selectedOffering && (
        <ReviewForm
          courseCode={courseCode}
          courseName={`${formatCourseCode(selectedOffering.code)} - ${selectedOffering.name}`}
          isOpen={isReviewFormOpen}
          onClose={() => setIsReviewFormOpen(false)}
          onSuccess={refetchReviews}
        />
      )}
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
