"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, GraduationCap, Clock, Users, BookOpen } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { coursesApi, type Course } from "@/lib/api/courses"

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
        const randomCourses = [...allCourses].sort(() => Math.random() - 0.5).slice(0, 4)
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <GraduationCap className="h-7 w-7 text-primary" />
            <span className="text-2xl font-bold text-primary">YUPlan</span>
          </Link>
          <p className="text-sm text-muted-foreground hidden md:block">Course selection, de-cluttered.</p>
          {/* <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm">
              Login
            </Button>
            <Button size="sm">Sign Up</Button>
          </div> */}
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold text-balance leading-tight">Plan your perfect semester</h1>
          <p className="text-lg md:text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
            Browse courses, compare sections, and build your schedule with ease. No more confusion, just clarity.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto pt-4">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <Input
              type="search"
              placeholder="Search for courses..."
              className="pl-12 pr-4 py-0 h-14 text-base bg-card shadow-sm leading-[3.5rem]"
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
            
            {/* Search Results Dropdown */}
            {showResults && isFocused && (
              <Card className="absolute top-full mt-2 w-full max-h-[400px] overflow-y-auto z-50 shadow-xl border-border bg-card text-left">
                {isSearching ? (
                  <div className="p-6 text-muted-foreground">
                    <div className="animate-pulse">Searching...</div>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="p-6 text-muted-foreground">
                    No courses found for "{searchQuery}"
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {searchResults.map((course) => (
                      <Link
                        key={course.code}
                        href={`/course/${course.code.toLowerCase().replace(/\s+/g, "-")}`}
                        className="block p-4 hover:bg-muted/70 transition-colors text-left"
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0 text-left">
                            <h4 className="font-semibold text-foreground mb-1 text-left">{course.code}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-1 text-left">{course.name}</p>
                          </div>
                          <Badge variant="secondary" className="shrink-0">{course.credits} credits</Badge>
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
      <section className="container mx-auto px-4 py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Trending Courses</h2>
              <p className="text-muted-foreground">Most popular courses this semester</p>
            </div>
            <Button variant="outline">View All</Button>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading courses...</div>
          ) : error ? (
            <div className="text-center py-12 text-destructive">{error}</div>
          ) : topCourses.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No courses available.</div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {topCourses.map((course) => (
                <Link key={course.code} href={`/course/${course.code.toLowerCase().replace(/\s+/g, "-")}`}>
                  <Card className="p-6 hover:shadow-lg transition-all hover:border-primary/50 cursor-pointer group">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-xl mb-1 group-hover:text-primary transition-colors">
                          {course.code}
                        </h3>
                        <p className="text-sm text-foreground font-medium">{course.name}</p>
                      </div>
                      <Badge variant="secondary">{course.credits} credits</Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        <span>{course.sections} Sections </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <p className="text-sm text-muted-foreground">{course.instructor}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="group-hover:bg-primary group-hover:text-primary-foreground"
                        onClick={(e) => e.preventDefault()}
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
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Everything you need to plan your courses</h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="text-center space-y-3">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold text-lg">Smart Search</h3>
              <p className="text-sm text-muted-foreground">
                Find courses by code, title, instructor, or department with intelligent filtering
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold text-lg">Course Details</h3>
              <p className="text-sm text-muted-foreground">
                Get complete information on prerequisites, descriptions, and section availability
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-primary">YUPlan</span>
            </div>
            <nav className="flex items-center gap-6 text-sm">
              <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                Home
              </Link>
              <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                About
              </Link>
              <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  )
}
