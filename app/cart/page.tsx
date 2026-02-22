"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useCart, type CartItem } from "@/components/cart-context"
import {
  Trash2,
  Calendar,
  Clock,
  MapPin,
  BookOpen,
  Download,
  AlertTriangle,
  ShoppingCart,
} from "lucide-react"
import Link from "next/link"
import { useState, useRef, useCallback } from "react"
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const COURSE_COLORS = [
  { bg: "bg-red-100 dark:bg-red-900/40", border: "border-red-300 dark:border-red-700", text: "text-red-800 dark:text-red-200", print: "#fee2e2" },
  { bg: "bg-blue-100 dark:bg-blue-900/40", border: "border-blue-300 dark:border-blue-700", text: "text-blue-800 dark:text-blue-200", print: "#dbeafe" },
  { bg: "bg-emerald-100 dark:bg-emerald-900/40", border: "border-emerald-300 dark:border-emerald-700", text: "text-emerald-800 dark:text-emerald-200", print: "#d1fae5" },
  { bg: "bg-amber-100 dark:bg-amber-900/40", border: "border-amber-300 dark:border-amber-700", text: "text-amber-800 dark:text-amber-200", print: "#fef3c7" },
  { bg: "bg-purple-100 dark:bg-purple-900/40", border: "border-purple-300 dark:border-purple-700", text: "text-purple-800 dark:text-purple-200", print: "#f3e8ff" },
  { bg: "bg-pink-100 dark:bg-pink-900/40", border: "border-pink-300 dark:border-pink-700", text: "text-pink-800 dark:text-pink-200", print: "#fce7f3" },
  { bg: "bg-cyan-100 dark:bg-cyan-900/40", border: "border-cyan-300 dark:border-cyan-700", text: "text-cyan-800 dark:text-cyan-200", print: "#cffafe" },
  { bg: "bg-orange-100 dark:bg-orange-900/40", border: "border-orange-300 dark:border-orange-700", text: "text-orange-800 dark:text-orange-200", print: "#ffedd5" },
]

const SLOT_HEIGHT = 48

const TERM_DISPLAY_MAP: Record<string, { label: string; period: string }> = {
  fall: { label: "Fall Semester", period: "September - December" },
  winter: { label: "Winter Semester", period: "January - April" },
  summer: { label: "Summer Semester", period: "May - August" },
  year: { label: "Full Year", period: "September - April" },
}

const DAY_DISPLAY_ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri"] as const

function toTitleCase(value: string): string {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ")
}

function normalizeTerm(value: string): string {
  return value.trim().toLowerCase()
}

function getTermDisplayInfo(termKey: string): { label: string; period: string } {
  const normalized = normalizeTerm(termKey)
  const known = TERM_DISPLAY_MAP[normalized]
  if (known) return known
  return { label: toTitleCase(termKey) || "Unspecified Term", period: "" }
}

function normalizeDayToken(value: string): string {
  const normalized = value.trim().toLowerCase().replace(/\./g, "")
  const dayMap: Record<string, string> = {
    m: "Mon",
    mon: "Mon",
    monday: "Mon",
    t: "Tue",
    tu: "Tue",
    tue: "Tue",
    tues: "Tue",
    tuesday: "Tue",
    w: "Wed",
    wed: "Wed",
    wednesday: "Wed",
    th: "Thu",
    thu: "Thu",
    thur: "Thu",
    thurs: "Thu",
    thursday: "Thu",
    f: "Fri",
    fri: "Fri",
    friday: "Fri",
  }
  return dayMap[normalized] ?? value.trim()
}

function orderDays(days: string[]): string[] {
  const unique = Array.from(new Set(days.filter(Boolean)))
  const known = unique.filter((day) => DAY_DISPLAY_ORDER.includes(day as (typeof DAY_DISPLAY_ORDER)[number]))
  const unknown = unique.filter((day) => !DAY_DISPLAY_ORDER.includes(day as (typeof DAY_DISPLAY_ORDER)[number]))
  known.sort((a, b) => DAY_DISPLAY_ORDER.indexOf(a as (typeof DAY_DISPLAY_ORDER)[number]) - DAY_DISPLAY_ORDER.indexOf(b as (typeof DAY_DISPLAY_ORDER)[number]))
  unknown.sort((a, b) => a.localeCompare(b))
  return [...known, ...unknown]
}

function getScheduleHours(blocks: ScheduleBlock[]): { startHour: number; endHour: number } {
  if (blocks.length === 0) return { startHour: 8, endHour: 21 }

  const minStart = Math.min(...blocks.map((block) => block.startTime))
  const maxEnd = Math.max(...blocks.map((block) => block.endTime))

  const startHour = Math.max(0, Math.floor(minStart) - 1)
  const endHour = Math.min(24, Math.ceil(maxEnd) + 1)

  if (endHour - startHour < 1) {
    return { startHour: 8, endHour: 21 }
  }

  return { startHour, endHour }
}

function parseTime(timeStr: string): { start: number; end: number } | null {
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/)
  if (!match) return null
  const startH = Number.parseInt(match[1])
  const startM = Number.parseInt(match[2])
  const endH = Number.parseInt(match[3])
  const endM = Number.parseInt(match[4])
  return { start: startH + startM / 60, end: endH + endM / 60 }
}

function parseDays(dayStr: string): string[] {
  return dayStr
    .split(/[/,;&]+/)
    .map((d) => normalizeDayToken(d))
    .filter(Boolean)
}

interface ScheduleBlock {
  item: CartItem
  day: string
  startTime: number
  endTime: number
  colorIndex: number
}

function buildScheduleBlocks(termItems: CartItem[], globalColorMap: Record<string, number>): ScheduleBlock[] {
  const blocks: ScheduleBlock[] = []

  for (const item of termItems) {
    const parsed = parseTime(item.time)
    if (!parsed) continue
    const days = parseDays(item.day)
    for (const day of days) {
      blocks.push({
        item,
        day,
        startTime: parsed.start,
        endTime: parsed.end,
        colorIndex: globalColorMap[item.courseCode] ?? 0,
      })
    }
  }
  return blocks
}

function detectConflicts(blocks: ScheduleBlock[]): Set<string> {
  const conflicts = new Set<string>()
  for (let i = 0; i < blocks.length; i++) {
    for (let j = i + 1; j < blocks.length; j++) {
      const a = blocks[i]
      const b = blocks[j]
      if (a.day === b.day && a.startTime < b.endTime && b.startTime < a.endTime) {
        conflicts.add(a.item.id)
        conflicts.add(b.item.id)
      }
    }
  }
  return conflicts
}

function ScheduleTimetable({ termItems, termKey, conflicts, globalColorMap }: { termItems: CartItem[]; termKey: string; conflicts: Set<string>; globalColorMap: Record<string, number> }) {
  const blocks = buildScheduleBlocks(termItems, globalColorMap)
  const termInfo = getTermDisplayInfo(termKey)
  const days = orderDays(blocks.map((block) => block.day))
  const dayColumns = days.length > 0 ? days : [...DAY_DISPLAY_ORDER.slice(0, 5)]
  const { startHour, endHour } = getScheduleHours(blocks)
  const halfHourRows = (endHour - startHour) * 2

  // Build term-specific legend from the global map
  const termCourses = new Set(termItems.map(i => i.courseCode))
  const courseColorMap: Record<string, number> = {}
  for (const code of termCourses) {
    courseColorMap[code] = globalColorMap[code] ?? 0
  }

  return (
    <div data-term-schedule={termKey} className="bg-card border border-border rounded-lg overflow-hidden p-4">
      <div className="text-center mb-4 pb-3 border-b border-border">
        <h3 className="text-xl font-bold">{termInfo.label} Schedule</h3>
        <p className="text-sm text-muted-foreground">{termInfo.period}</p>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-175" style={{ minWidth: `${Math.max(dayColumns.length, 5) * 140}px` }}>
          <div className="grid gap-0" style={{ gridTemplateColumns: `60px repeat(${dayColumns.length}, minmax(0, 1fr))` }}>
            <div className="h-10" />
            {dayColumns.map((day) => (
              <div key={day} className="h-10 flex items-center justify-center font-semibold text-sm border-b border-border bg-muted/50">
                {day}
              </div>
            ))}
          </div>

          <div className="grid gap-0 relative" style={{ gridTemplateColumns: `60px repeat(${dayColumns.length}, minmax(0, 1fr))` }}>
            <div>
              {Array.from({ length: halfHourRows }, (_, i) => {
                const hour = startHour + Math.floor(i / 2)
                const isHour = i % 2 === 0
                return (
                  <div key={i} className="flex items-start justify-end pr-2 text-xs text-muted-foreground" style={{ height: SLOT_HEIGHT }}>
                    {isHour && (
                      <span className="-mt-2">
                        {hour > 12 ? `${hour - 12}PM` : hour === 12 ? "12PM" : `${hour}AM`}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>

            {dayColumns.map((day) => {
              const dayBlocks = blocks.filter((b) => b.day === day)
              return (
                <div key={day} className="relative border-l border-border" style={{ height: halfHourRows * SLOT_HEIGHT }}>
                  {Array.from({ length: halfHourRows }, (_, i) => (
                    <div key={i} className={`absolute left-0 right-0 border-b ${i % 2 === 0 ? "border-border" : "border-border/30"}`} style={{ top: i * SLOT_HEIGHT }} />
                  ))}
                  {dayBlocks.map((block, idx) => {
                    const top = (block.startTime - startHour) * 2 * SLOT_HEIGHT
                    const height = (block.endTime - block.startTime) * 2 * SLOT_HEIGHT
                    const color = COURSE_COLORS[block.colorIndex]
                    const hasConflict = conflicts.has(block.item.id)
                    return (
                      <div
                        key={`${block.item.id}-${idx}`}
                        className={`absolute left-1 right-1 rounded-md border px-2 py-1 overflow-hidden ${color.bg} ${color.border} ${color.text} ${hasConflict ? "ring-2 ring-destructive" : ""}`}
                        style={{ top, height }}
                      >
                        <p className="text-xs font-bold truncate">{block.item.courseCode}</p>
                        <p className="text-xs truncate">{block.item.typeLabel}</p>
                        {height > 60 && <p className="text-xs truncate opacity-75">{block.item.location}</p>}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-border flex flex-wrap gap-3">
        {Object.entries(courseColorMap).map(([code, colorIdx]) => (
          <div key={code} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded ${COURSE_COLORS[colorIdx].bg} ${COURSE_COLORS[colorIdx].border} border`} />
            <span className="text-xs font-medium">{code}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function CartPage() {
  const { items, removeItem, clearCart } = useCart()
  const [showSchedule, setShowSchedule] = useState(false)
  const scheduleRef = useRef<HTMLDivElement>(null)

  // Group items by course code
  const groupedItems: Record<string, CartItem[]> = {}
  for (const item of items) {
    if (!groupedItems[item.courseCode]) {
      groupedItems[item.courseCode] = []
    }
    groupedItems[item.courseCode].push(item)
  }
  const courseList = Object.keys(groupedItems)

  // Group items by term
  const itemsByTerm: Record<string, CartItem[]> = {}
  for (const item of items) {
    const term = normalizeTerm(item.term || "") || "unspecified"
    if (!itemsByTerm[term]) {
      itemsByTerm[term] = []
    }
    itemsByTerm[term].push(item)

    // Full-year courses appear in both fall and winter
    if (term === "year") {
      if (!itemsByTerm["fall"]) itemsByTerm["fall"] = []
      if (!itemsByTerm["winter"]) itemsByTerm["winter"] = []
      // Avoid duplicates
      if (!itemsByTerm["fall"].some(i => i.id === item.id)) {
        itemsByTerm["fall"].push(item)
      }
      if (!itemsByTerm["winter"].some(i => i.id === item.id)) {
        itemsByTerm["winter"].push(item)
      }
    }
  }
  // Remove the standalone "year" group since its items are merged into fall/winter
  delete itemsByTerm["year"]

  // Build a global color map: one unique color per course code across all terms
  const globalColorMap: Record<string, number> = {}
  let globalColorIdx = 0
  for (const item of items) {
    if (!(item.courseCode in globalColorMap)) {
      globalColorMap[item.courseCode] = globalColorIdx % COURSE_COLORS.length
      globalColorIdx++
    }
  }

  // Order terms with known terms first, then any additional terms alphabetically
  const knownTermOrder = ["fall", "winter", "summer"]
  const presentTerms = Object.keys(itemsByTerm).filter((term) => itemsByTerm[term]?.length > 0)
  const orderedTerms = [
    ...knownTermOrder.filter((term) => presentTerms.includes(term)),
    ...presentTerms
      .filter((term) => !knownTermOrder.includes(term))
      .sort((a, b) => getTermDisplayInfo(a).label.localeCompare(getTermDisplayInfo(b).label)),
  ]

  // Compute conflicts per term
  const conflictsByTerm: Record<string, Set<string>> = {}
  for (const term of orderedTerms) {
    conflictsByTerm[term] = detectConflicts(buildScheduleBlocks(itemsByTerm[term], globalColorMap))
  }
  const allConflicts = new Set<string>()
  for (const s of Object.values(conflictsByTerm)) {
    for (const id of s) allConflicts.add(id)
  }

  const handleGenerateSchedule = () => {
    setShowSchedule(true)
    setTimeout(() => {
      scheduleRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 100)
  }

  const handleSaveAsPdf = async () => {
    if (!scheduleRef.current) return
    const { default: html2canvas } = await import("html2canvas-pro")
    const { jsPDF } = await import("jspdf")

    // Find each individual term timetable inside the ref
    const termElements = scheduleRef.current.querySelectorAll<HTMLElement>("[data-term-schedule]")
    if (termElements.length === 0) return

    // Create PDF in landscape A4
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    })
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 8

    for (let i = 0; i < termElements.length; i++) {
      if (i > 0) pdf.addPage()

      const canvas = await html2canvas(termElements[i], {
        scale: 1.5,
        useCORS: true,
        backgroundColor: "#ffffff",
      })

      // Convert to JPEG at 80% quality for smaller file size
      const imgData = canvas.toDataURL("image/jpeg", 0.8)

      // Fit image within page margins while preserving aspect ratio
      const availableW = pageWidth - margin * 2
      const availableH = pageHeight - margin * 2
      const imgRatio = canvas.width / canvas.height
      let drawW = availableW
      let drawH = drawW / imgRatio
      if (drawH > availableH) {
        drawH = availableH
        drawW = drawH * imgRatio
      }
      const offsetX = margin + (availableW - drawW) / 2
      const offsetY = margin + (availableH - drawH) / 2

      pdf.addImage(imgData, "JPEG", offsetX, offsetY, drawW, drawH)
    }

    pdf.save("YorkUPlan-Schedule.pdf")
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header subtitle="Course selection, de-cluttered."/>
      <div className="container mx-auto px-4 py-8 flex-1 w-full">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <Link href="/courses" className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block">
              ← Back to courses
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">Your Cart</h1>
                <p className="text-muted-foreground">
                  {items.length === 0
                    ? "Your cart is empty. Add sections from a course page."
                    : `${items.length} item${items.length === 1 ? "" : "s"} across ${courseList.length} course${courseList.length === 1 ? "" : "s"}`}
                </p>
              </div>
              {items.length > 0 && (
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" onClick={clearCart}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Cart
                  </Button>
                  <Button size="sm" onClick={handleGenerateSchedule}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Generate Schedule
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Empty State */}
          {items.length === 0 && (
            <Card className="p-12 text-center">
              <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">No items in your cart</h2>
              <p className="text-muted-foreground mb-6">
                Browse courses and add them to cart to start building your schedule.
              </p>
              <Link href="/courses">
                <Button>Browse Courses</Button>
              </Link>
            </Card>
          )}

          {/* Cart Items grouped by term then course */}
          {orderedTerms.length > 0 && (
            <div className="space-y-8 mb-8">
              {orderedTerms.map((term) => {
                const termItems = itemsByTerm[term]
                const termInfo = getTermDisplayInfo(term)
                const termGrouped: Record<string, CartItem[]> = {}
                for (const item of termItems) {
                  if (!termGrouped[item.courseCode]) termGrouped[item.courseCode] = []
                  termGrouped[item.courseCode].push(item)
                }
                const termCourseList = Object.keys(termGrouped)

                return (
                  <div key={term}>
                    <div className="flex items-center gap-3 mb-4">
                      <h2 className="text-xl font-bold">{termInfo.label}</h2>
                      <Badge variant="secondary">{termInfo.period}</Badge>
                      <Badge variant="outline">{termCourseList.length} course{termCourseList.length !== 1 && "s"}</Badge>
                    </div>

                    <div className="space-y-4">
                      {termCourseList.map((courseCode) => {
                        const courseItems = termGrouped[courseCode]
                        const first = courseItems[0]
                        return (
                          <Card key={courseCode} className="overflow-hidden">
                            <div className="p-4 bg-muted/50 border-b border-border">
                              <div className="flex items-center justify-between">
                                <div>
                                  <Link
                                    href={`/course/${courseCode.toLowerCase().replace(/\s+/g, "-")}`}
                                    className="text-lg font-bold text-primary hover:underline"
                                  >
                                    {courseCode}
                                  </Link>
                                  <p className="text-sm text-muted-foreground">{first.courseName}</p>
                                </div>
                                <Badge variant="secondary">{courseItems.length} item{courseItems.length !== 1 && "s"}</Badge>
                              </div>
                            </div>
                            <div className="divide-y divide-border">
                              {courseItems.map((item) => (
                                <div key={item.id} className="p-4 flex items-center gap-4">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Badge variant="outline" className="text-xs">Section {item.section}</Badge>
                                      <Badge variant="secondary" className="text-xs">{item.typeLabel}</Badge>
                                      {allConflicts.has(item.id) && (
                                        <Badge variant="destructive" className="text-xs">
                                          <AlertTriangle className="h-3 w-3 mr-1" />
                                          Conflict
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-1">
                                      <span className="flex items-center gap-1">
                                        <Calendar className="h-3.5 w-3.5" />{item.day}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Clock className="h-3.5 w-3.5" />{item.time}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <MapPin className="h-3.5 w-3.5" />{item.location}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <BookOpen className="h-3.5 w-3.5" />{item.instructor}
                                      </span>
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                    onClick={() => removeItem(item.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Remove {item.typeLabel}</span>
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </Card>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Conflict Warning */}
          {allConflicts.size > 0 && showSchedule && (
            <Card className="p-4 mb-6 border-destructive bg-destructive/5">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
                <div>
                  <p className="font-medium text-destructive">Schedule Conflict Detected</p>
                  <p className="text-sm text-muted-foreground">
                    Some items have overlapping times. Review your selections above.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Schedule Timetables - one per term */}
          {showSchedule && items.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Your Schedule</h2>
                <Button variant="outline" size="sm" onClick={handleSaveAsPdf}>
                  <Download className="h-4 w-4 mr-2" />
                  Save as PDF
                </Button>
              </div>

              <div ref={scheduleRef} className="space-y-8">
                {orderedTerms.map((term) => (
                  <ScheduleTimetable
                    key={term}
                    termItems={itemsByTerm[term]}
                    termKey={term}
                    conflicts={conflictsByTerm[term]}
                    globalColorMap={globalColorMap}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}
