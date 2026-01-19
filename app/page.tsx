"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Search, BookOpen } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { coursesApi, type Course, formatCourseCode } from "@/lib/api/courses"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function HomePage() {
  const [topCourses, setTopCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Course[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    async function fetchCourses() {
      try {
        const allCourses = await coursesApi.getAllCourses()
        const randomCourses = [...allCourses]
          .sort(() => Math.random() - 0.5)
          .slice(0, 4)
        setTopCourses(randomCourses)
      } catch (error) {
        console.error("Failed to fetch courses:", error)
        setError("Failed to load courses. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCourses()
  }, [])

  useEffect(() => {
    const delaySearch = setTimeout(async () => {
      if (searchQuery.trim().length > 0) {
        setIsSearching(true)
        setShowResults(true)
        try {
          const results = await coursesApi.searchCourses(searchQuery)
          setSearchResults(results)
        } catch (error) {
          console.error("Search failed:", error)
          setSearchResults([])
        } finally {
          setIsSearching(false)
        }
      } else {
        setSearchResults([])
        setShowResults(false)
      }
    }, 300) // 300ms debounce

    return () => clearTimeout(delaySearch)
  }, [searchQuery])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header subtitle="Course selection, de-cluttered." />

      <div className="flex-grow flex flex-col">
        {/* Hero Section */}
        <section className="container mx-auto px-3 sm:px-4 py-8 sm:py-12 md:py-24">
          <div className="max-w-4xl mx-auto text-center space-y-4 sm:space-y-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-balance leading-tight">
              Plan your perfect semester
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground text-pretty max-w-2xl mx-auto px-2 sm:px-0">
              Browse courses, compare sections, and build your schedule with
              ease. No more confusion, just clarity.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto pt-2 sm:pt-4 px-2 sm:px-0">
              <InputGroup className="h-12 sm:h-14 text-sm sm:text-base bg-card shadow-sm">
                <InputGroupAddon align="inline-start">
                  <Search
                    className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground"
                    strokeWidth={2.5}
                  />
                </InputGroupAddon>
                <InputGroupInput
                  type="search"
                  placeholder="Search courses..."
                  className="text-sm sm:text-base"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => {
                    setTimeout(() => {
                      setIsFocused(false)
                      setShowResults(false)
                    }, 200)
                  }}
                />
              </InputGroup>

              {/* Search Results Dropdown */}
              {showResults && isFocused && (
                <Card className="absolute top-full mt-2 w-full max-h-[50vh] sm:max-h-[400px] overflow-y-auto z-50 shadow-xl border-border bg-card text-left">
                  {isSearching ? (
                    <div className="p-4 sm:p-6 text-muted-foreground">
                      <div className="animate-pulse">Searching...</div>
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="p-4 sm:p-6 text-muted-foreground text-sm sm:text-base">
                      No courses found for "{searchQuery}"
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {searchResults.map((course) => (
                        <Link
                          key={course.id}
                          href={`/course/${course.id}`}
                          className="block p-3 sm:p-4 hover:bg-muted/70 transition-colors text-left"
                          onMouseDown={(e) => e.preventDefault()}
                        >
                          <div className="flex items-start justify-between gap-2 sm:gap-4">
                            <div className="flex-1 min-w-0 text-left">
                              <h4 className="font-semibold text-foreground mb-1 text-sm sm:text-base text-left">
                                {formatCourseCode(course.code)}
                              </h4>
                              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1 text-left">
                                {course.name}
                              </p>
                            </div>
                            <Badge
                              variant="secondary"
                              className="shrink-0 text-xs sm:text-sm"
                            >
                              {course.credits} credit
                              {course.credits === 1 ? "" : "s"}
                            </Badge>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </Card>
              )}
            </div>
          </div>
        </section>

        {/* Top Courses Section */}
        <section className="container mx-auto px-3 sm:px-4 py-8 sm:py-12 md:py-16">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                  Trending Courses
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Most popular courses this semester
                </p>
              </div>
              <Link href="/courses" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="group-hover:bg-primary group-hover:text-primary-foreground w-full sm:w-auto text-xs sm:text-sm shadow-md hover:shadow-lg border-2 sm:border-2"
                >
                  View All
                </Button>
              </Link>
            </div>

            {isLoading ? (
              <div className="text-center py-8 sm:py-12 text-muted-foreground">
                Loading courses...
              </div>
            ) : error ? (
              <div className="text-center py-8 sm:py-12 text-destructive">
                {error}
              </div>
            ) : topCourses.length === 0 ? (
              <div className="text-center py-8 sm:py-12 text-muted-foreground">
                No courses available.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {topCourses.map((course) => (
                  <Link key={course.id} href={`/course/${course.id}`}>
                    <Card className="p-4 sm:p-6 hover:shadow-lg transition-all hover:border-primary/50 cursor-pointer group flex flex-col h-full">
                      <div className="flex items-start justify-between mb-3 flex-shrink-0 gap-2 sm:gap-3">
                        <div className="flex-1 min-w-0 pr-2">
                          <h3 className="font-bold text-lg sm:text-xl mb-1 group-hover:text-primary transition-colors line-clamp-1">
                            {formatCourseCode(course.code)}
                          </h3>
                          <p className="text-xs sm:text-sm text-foreground font-medium line-clamp-2">
                            {course.name}
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className="flex-shrink-0 text-xs sm:text-sm"
                        >
                          {course.credits} credit
                          {course.credits === 1 ? "" : "s"}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-3 flex-shrink-0">
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span>
                            {course.sections} Section
                            {course.sections === 1 ? "" : "s"}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-3 border-t border-border mt-auto gap-2">
                        <p className="text-xs sm:text-sm text-muted-foreground truncate flex-1 min-w-0">
                          {course.instructor}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="group-hover:bg-primary group-hover:text-primary-foreground w-full sm:w-auto text-xs sm:text-sm shadow-md hover:shadow-lg border-2 sm:border-2"
                        >
                          View Details
                        </Button>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-3 sm:px-4 py-8 sm:py-12 md:py-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">
              Everything you need to plan your courses
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
              <div className="text-center space-y-3">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold text-base sm:text-lg">Smart Search</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Find courses by code, title, instructor, or department with
                  intelligent filtering
                </p>
              </div>

              <div className="text-center space-y-3">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold text-base sm:text-lg">
                  Course Details
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Get complete information on prerequisites, descriptions, and
                  section availability
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}
