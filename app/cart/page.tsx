"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
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
import { useState, useRef, useEffect } from "react"
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useIsMobile } from "@/hooks/use-mobile"
import Logo from "@/public/logo.webp"

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const cardVariant = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

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
const TABLET_BREAKPOINT = 1024

function useIsTabletOrBelow() {
  const [isTabletOrBelow, setIsTabletOrBelow] = useState<boolean | undefined>(undefined)

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${TABLET_BREAKPOINT - 1}px)`)
    const onChange = () => setIsTabletOrBelow(window.innerWidth < TABLET_BREAKPOINT)
    mql.addEventListener("change", onChange)
    onChange()
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isTabletOrBelow
}

const TERM_DISPLAY_MAP: Record<string, { label: string; period: string }> = {
  fall: { label: "Fall Semester", period: "September - December" },
  winter: { label: "Winter Semester", period: "January - April" },
  summer: { label: "Summer Semester", period: "May - August" },
  year: { label: "Full Year", period: "September - April" },
}

const DAY_DISPLAY_ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri"] as const
const PRIMARY_COMPONENT_TYPES = new Set(["LECT", "SEMR", "ONLN", "BLEN"])
const SECONDARY_COMPONENT_TYPES = new Set(["LAB", "TUTR", "TUT", "STDO"])
const MONTH_LABELS = ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"]
const MONTH_INDEX: Record<string, number> = {
  sep: 0,
  oct: 1,
  nov: 2,
  dec: 3,
  jan: 4,
  feb: 5,
  mar: 6,
  apr: 7,
  may: 8,
  jun: 9,
  jul: 10,
  aug: 11,
}

function normalizeComponentType(value: string): string {
  return (value || "").trim().toUpperCase()
}

function normalizeMonthName(value: string): string {
  const trimmed = value.trim().toLowerCase()
  if (trimmed.length <= 3) return trimmed
  return trimmed.slice(0, 3)
}

type TermDuration = { start: string; end: string }

const TERM_CODE_DURATION: Record<string, TermDuration> = {
  ES: { start: "April", end: "May" },
  LS: { start: "April", end: "May" },
  NW: { start: "April", end: "May" },
  NV: { start: "April", end: "June" },
  Q5: { start: "April", end: "June" },
  Q6: { start: "April", end: "June" },
  ET: { start: "April", end: "October" },
  I1: { start: "May", end: "May" },
  S4: { start: "May", end: "May" },
  C1: { start: "May", end: "June" },
  E: { start: "May", end: "June" },
  H1: { start: "May", end: "June" },
  I2: { start: "May", end: "June" },
  J1: { start: "May", end: "June" },
  O1: { start: "May", end: "June" },
  OE: { start: "May", end: "June" },
  Q8: { start: "May", end: "June" },
  S1: { start: "May", end: "June" },
  BS: { start: "May", end: "July" },
  C3: { start: "May", end: "July" },
  S: { start: "May", end: "July" },
  S3: { start: "May", end: "July" },
  SA: { start: "May", end: "July" },
  SP: { start: "May", end: "July" },
  SU: { start: "May", end: "August" },
  Z3: { start: "May", end: "December" },
  Z4: { start: "May", end: "April" },
  J2: { start: "June", end: "June" },
  K: { start: "June", end: "June" },
  L2: { start: "June", end: "June" },
  C2: { start: "June", end: "July" },
  G: { start: "June", end: "July" },
  H2: { start: "June", end: "July" },
  I3: { start: "June", end: "July" },
  J3: { start: "June", end: "July" },
  J8: { start: "June", end: "July" },
  O2: { start: "June", end: "July" },
  OB: { start: "June", end: "July" },
  Q7: { start: "June", end: "July" },
  L3: { start: "June", end: "August" },
  NT: { start: "June", end: "August" },
  S2: { start: "June", end: "August" },
  C4: { start: "July", end: "July" },
  D2: { start: "July", end: "July" },
  NX: { start: "July", end: "August" },
  OA: { start: "July", end: "August" },
  EM: { start: "August", end: "November" },
  F: { start: "September", end: "December" },
  W: { start: "January", end: "April" },
  Y: { start: "September", end: "April" },
  Z1: { start: "September", end: "April" },
  E1: { start: "August", end: "August" },
  B1: { start: "August", end: "September" },
  FO: { start: "August", end: "November" },
  NQ: { start: "August", end: "April" },
  FW: { start: "August", end: "May" },
  F4: { start: "September", end: "September" },
  LA: { start: "September", end: "September" },
  M3: { start: "September", end: "September" },
  A: { start: "September", end: "October" },
  FA: { start: "September", end: "October" },
  LB: { start: "September", end: "October" },
  M1: { start: "September", end: "October" },
  M4: { start: "September", end: "October" },
  FP: { start: "September", end: "November" },
  B2: { start: "September", end: "December" },
  EF: { start: "September", end: "December" },
  F2: { start: "September", end: "December" },
  F3: { start: "September", end: "December" },
  B3: { start: "September", end: "May" },
  FS: { start: "September", end: "August" },
  GY: { start: "September", end: "August" },
  LC: { start: "October", end: "November" },
  FB: { start: "October", end: "December" },
  M: { start: "October", end: "December" },
  M2: { start: "October", end: "December" },
  M5: { start: "November", end: "November" },
  LD: { start: "November", end: "December" },
  M6: { start: "November", end: "December" },
  ER: { start: "January", end: "January" },
  W4: { start: "January", end: "January" },
  C: { start: "January", end: "February" },
  M7: { start: "January", end: "February" },
  WA: { start: "January", end: "February" },
  NU: { start: "January", end: "March" },
  B4: { start: "January", end: "April" },
  EW: { start: "January", end: "April" },
  W2: { start: "January", end: "April" },
  W3: { start: "January", end: "April" },
  WL: { start: "January", end: "April" },
  WO: { start: "January", end: "April" },
  E4: { start: "January", end: "October" },
  WS: { start: "January", end: "August" },
  WP: { start: "January", end: "May" },
  RW: { start: "February", end: "February" },
  O3: { start: "February", end: "March" },
  N: { start: "February", end: "April" },
  WB: { start: "February", end: "April" },
  GH: { start: "April", end: "April" },
}

const TERM_CODE_KEYS = Object.keys(TERM_CODE_DURATION).sort((a, b) => b.length - a.length)

function extractTermCode(value: string): string | null {
  const normalized = value.toUpperCase()
  for (const code of TERM_CODE_KEYS) {
    const matcher = new RegExp(`\\b${code}\\b`)
    if (matcher.test(normalized)) return code
  }
  return null
}

function getTermDuration(termKey: string): TermDuration | null {
  const normalized = termKey.toLowerCase()
  const hasEducation = /education|educ/.test(normalized)
  const hasSchulich = /schulich|business/.test(normalized)
  const hasGrad = /grad|graduate/.test(normalized)
  const hasHealth = /health/.test(normalized)

  if (/full\s*year/.test(normalized)) return TERM_CODE_DURATION.Y
  if (/\bfall\b/.test(normalized)) return TERM_CODE_DURATION.F
  if (/\bwinter\b/.test(normalized)) return TERM_CODE_DURATION.W
  if (/\bsummer\b/.test(normalized)) return { start: "May", end: "August" }

  const extractedCode = extractTermCode(termKey)

  if (extractedCode === "WP") {
    if (hasEducation) return { start: "January", end: "May" }
    if (hasSchulich) return { start: "January", end: "March" }
  }

  if (extractedCode === "RW") {
    if (hasHealth) return { start: "February", end: "March" }
    if (hasEducation || hasGrad) return { start: "February", end: "February" }
  }

  if (extractedCode && TERM_CODE_DURATION[extractedCode]) {
    return TERM_CODE_DURATION[extractedCode]
  }

  return null
}

function getMonthRangeIndices(startLabel: string, endLabel: string): { active: Set<number>; startIdx: number; endIdx: number } | null {
  const startIdx = MONTH_INDEX[normalizeMonthName(startLabel)]
  const endIdx = MONTH_INDEX[normalizeMonthName(endLabel)]
  if (startIdx === undefined || endIdx === undefined) return null

  const active = new Set<number>()
  if (startIdx <= endIdx) {
    for (let i = startIdx; i <= endIdx; i++) active.add(i)
  } else {
    for (let i = startIdx; i < MONTH_LABELS.length; i++) active.add(i)
    for (let i = 0; i <= endIdx; i++) active.add(i)
  }

  return { active, startIdx, endIdx }
}

function getActiveMonthSegments(active: Set<number>): Array<{ start: number; length: number }> {
  const segments: Array<{ start: number; length: number }> = []
  let currentStart: number | null = null

  for (let i = 0; i < MONTH_LABELS.length; i++) {
    const isActive = active.has(i)
    if (isActive && currentStart === null) {
      currentStart = i
    }
    const isSegmentEnd = !isActive && currentStart !== null
    const isLastActiveAtEnd = isActive && currentStart !== null && i === MONTH_LABELS.length - 1

    if (isSegmentEnd && currentStart !== null) {
      const segmentStart = currentStart
      segments.push({ start: segmentStart, length: i - segmentStart })
      currentStart = null
    } else if (isLastActiveAtEnd && currentStart !== null) {
      const segmentStart = currentStart
      segments.push({ start: segmentStart, length: i - segmentStart + 1 })
      currentStart = null
    }
  }

  return segments
}

function getVisibleMonthWindow(termKey: string): Array<{ label: string; index: number }> {
  const normalized = normalizeTerm(termKey)

  if (normalized === "fall") {
    return [
      
      { label: "Sep", index: 0 },
      { label: "Oct", index: 1 },
      { label: "Nov", index: 2 },
      { label: "Dec", index: 3 },
    ]
  }

  if (normalized === "winter") {
    return [
      { label: "Jan", index: 4 },
      { label: "Feb", index: 5 },
      { label: "Mar", index: 6 },
      { label: "Apr", index: 7 },
    ]
  }

  if (normalized === "summer") {
    return [
      { label: "May", index: 8 },
      { label: "Jun", index: 9 },
      { label: "Jul", index: 10 },
      { label: "Aug", index: 11 },
    ]
  }

  return MONTH_LABELS.map((label, idx) => ({ label, index: idx }))
}

function MonthRangeBar({ termLabel, compact = false, showLabel = true, activeClassName }: { termLabel: string; compact?: boolean; showLabel?: boolean; activeClassName?: string }) {
  const termDuration = getTermDuration(termLabel)
  if (!termDuration) return null
  const monthRange = getMonthRangeIndices(termDuration.start, termDuration.end)
  if (!monthRange) return null

  return (
    <div className={compact ? "mt-2" : "mt-0"}>
      {showLabel && (
        <div className={`flex items-center justify-between ${compact ? "text-[0.65rem]" : "text-xs"} text-muted-foreground mb-1`}>
          <span>Course Duration</span>
          <span>{termDuration.start} – {termDuration.end}</span>
        </div>
      )}
      <div className="grid grid-cols-12 gap-0 overflow-hidden rounded-md border border-border">
        {MONTH_LABELS.map((monthLabel, idx) => {
          const isActive = monthRange.active.has(idx)
          const isStart = idx === monthRange.startIdx
          const isEnd = idx === monthRange.endIdx
          const rounding = isActive
            ? isStart
              ? "rounded-l-md"
              : isEnd
                ? "rounded-r-md"
                : "rounded-none"
            : "rounded-none"

          return (
            <div
              key={monthLabel}
              className={`border-r border-border last:border-r-0 px-1 ${compact ? "py-0.5 text-[0.6rem]" : "py-1 text-[0.65rem]"} text-center font-medium ${rounding} ${
                isActive
                  ? activeClassName || "bg-primary/15 text-foreground"
                  : "bg-muted/30 text-muted-foreground"
              }`}
            >
              {monthLabel}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function getComponentSortRank(type: string): number {
  return PRIMARY_COMPONENT_TYPES.has(normalizeComponentType(type)) ? 0 : 1
}

function toTitleCase(value: string): string {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ")
}

function normalizeTerm(value: string): string {
  const normalized = value.trim().toLowerCase()
  const termMap: Record<string, string> = {
    f: "fall",
    fall: "fall",
    w: "winter",
    winter: "winter",
    s: "summer",
    summer: "summer",
    su: "summer",
    s1: "summer",
    "summer 1": "summer",
    "summer-1": "summer",
    s2: "summer",
    "summer 2": "summer",
    "summer-2": "summer",
    y: "year",
    year: "year",
    "full year": "year",
    "full-year": "year",
  }
  return termMap[normalized] ?? normalized
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
    s: "Sat",
    sat: "Sat",
    saturday: "Sat",
    u: "Sun",
    sun: "Sun",
    sunday: "Sun",
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
  const isMobile = useIsMobile()
  const isTabletOrBelow = useIsTabletOrBelow()
  const isSummerTerm = termKey === "summer" || termKey === "summer1" || termKey === "summer2"
  const isCompactTerm = termKey === "fall" || termKey === "winter" || (isTabletOrBelow && isSummerTerm)
  const compactSlotHeight = isMobile ? 36 : isTabletOrBelow ? 34 : 32
  const [activeBlock, setActiveBlock] = useState<ScheduleBlock | null>(null)
  const blocks = buildScheduleBlocks(termItems, globalColorMap)
  const termInfo = getTermDisplayInfo(termKey)
  const days = orderDays(blocks.map((block) => block.day))
  const baseDays = [...DAY_DISPLAY_ORDER.slice(0, 5)]
  const dayColumns = orderDays([...baseDays, ...days])
  const startHour = 8
  const endHour = 21
  const halfHourRows = (endHour - startHour) * 2
  const slotHeight = isCompactTerm ? compactSlotHeight : (isMobile ? 40 : SLOT_HEIGHT)
  const visibleMonthWindow = getVisibleMonthWindow(termKey)
  const runRowHeight = isCompactTerm ? 24 : (isMobile ? 24 : 28)
  const runBubbleHeight = isCompactTerm ? 18 : (isMobile ? 18 : 22)
  const timeColumnWidth = isCompactTerm ? 40 : (isMobile ? 48 : 60)
  const dayColumnMinWidth = isCompactTerm ? (isMobile ? 92 : isTabletOrBelow ? 88 : 80) : (isMobile ? 100 : 140)
  const showTapDetails = isTabletOrBelow

  // Build term-specific legend from the global map
  const termCourses = new Set(termItems.map(i => i.courseCode))
  const courseColorMap: Record<string, number> = {}
  for (const code of termCourses) {
    courseColorMap[code] = globalColorMap[code] ?? 0
  }

  const courseRuns = Array.from(termCourses)
    .map((courseCode) => {
      const courseItems = termItems.filter((item) => item.courseCode === courseCode)
      const termLabel = courseItems.find((item) => item.term)?.term || termKey
      const duration = getTermDuration(termLabel) || getTermDuration(termKey)
      const monthRange = duration ? getMonthRangeIndices(duration.start, duration.end) : null
      const colorIndex = courseColorMap[courseCode] ?? 0
      return duration && monthRange ? { courseCode, monthRange, colorIndex } : null
    })
    .filter((entry): entry is { courseCode: string; monthRange: { active: Set<number>; startIdx: number; endIdx: number }; colorIndex: number } => Boolean(entry))

  return (
    <div data-term-schedule={termKey} className="bg-card border border-border rounded-lg overflow-hidden p-3 sm:p-4">
      <div className={`${isCompactTerm ? "mb-2 pb-2" : "mb-4 pb-3"} border-b border-border`}>
        <h3 className={`${isCompactTerm ? "text-lg" : "text-xl"} font-bold`}>{termInfo.label}</h3>
        <p className="text-sm text-muted-foreground">{termInfo.period}</p>
      </div>

      {courseRuns.length > 0 && (
        <div className={`${isCompactTerm ? "mb-2" : "mb-4"}`}>
          <p className={`mb-2 ${isCompactTerm ? "text-[0.65rem]" : "text-xs"} text-muted-foreground`}>
            Course Duration
          </p>
          <div className="rounded-md border border-border overflow-hidden">
            <div className="grid border-b border-border bg-muted/30" style={{ gridTemplateColumns: `repeat(${visibleMonthWindow.length}, minmax(0, 1fr))` }}>
              {visibleMonthWindow.map((month) => (
                <div
                  key={month.label}
                  className={`px-1 text-center font-medium text-muted-foreground border-r border-border last:border-r-0 ${isCompactTerm ? "py-0.5 text-[0.6rem]" : "py-1 text-[0.65rem]"}`}
                >
                  {month.label}
                </div>
              ))}
            </div>

            {courseRuns.map((run) => (
              <div
                key={run.courseCode}
                className="relative grid border-b border-border last:border-b-0"
                style={{
                  gridTemplateColumns: `repeat(${visibleMonthWindow.length}, minmax(0, 1fr))`,
                  height: `${runRowHeight}px`,
                }}
              >
                {visibleMonthWindow.map((month) => (
                  <div
                    key={`${run.courseCode}-${month.label}`}
                    className="border-r border-border/70 last:border-r-0 h-full"
                  />
                ))}

                {(() => {
                  const visibleActive = new Set<number>()
                  for (let i = 0; i < visibleMonthWindow.length; i++) {
                    if (run.monthRange.active.has(visibleMonthWindow[i].index)) {
                      visibleActive.add(i)
                    }
                  }

                  return getActiveMonthSegments(visibleActive).map((segment, idx) => {
                    const color = COURSE_COLORS[run.colorIndex]
                    return (
                      <div
                        key={`${run.courseCode}-${idx}`}
                        className={`row-start-1 z-10 self-center mx-0.5 rounded-md border ${color.bg} ${color.border} ${color.text} flex items-center px-1.5`}
                        style={{
                          gridColumn: `${segment.start + 1} / span ${segment.length}`,
                          height: `${runBubbleHeight}px`,
                        }}
                      >
                        <span className={`font-semibold truncate ${isCompactTerm ? "text-[0.6rem]" : "text-[0.65rem]"}`}>
                          {run.courseCode}
                        </span>
                      </div>
                    )
                  })
                })()}

                <div className="sr-only">
                  {run.courseCode}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showTapDetails && (
        <p className="mb-2 text-xs text-muted-foreground">
          Tap a class block to view full details.
        </p>
      )}

      <div className="overflow-x-auto">
        <div className="min-w-175" style={{ minWidth: `${Math.max(dayColumns.length, 5) * dayColumnMinWidth}px` }}>
          <div className="grid gap-0" style={{ gridTemplateColumns: `${timeColumnWidth}px repeat(${dayColumns.length}, minmax(0, 1fr))` }}>
            <div className={isCompactTerm ? "h-8" : "h-10"} />
            {dayColumns.map((day) => (
              <div key={day} className={`flex items-center justify-center font-semibold border-b border-border bg-muted/50 ${isCompactTerm ? "h-8 text-xs" : "h-10 text-sm"}`}>
                {day}
              </div>
            ))}
          </div>

          <div className="grid gap-0 relative" style={{ gridTemplateColumns: `${timeColumnWidth}px repeat(${dayColumns.length}, minmax(0, 1fr))` }}>
            <div>
              {Array.from({ length: halfHourRows }, (_, i) => {
                const hour = startHour + Math.floor(i / 2)
                const isHour = i % 2 === 0
                return (
                  <div key={i} className={`flex items-start justify-end ${isCompactTerm ? "pr-1 text-xs" : "pr-2 text-xs"} text-muted-foreground`} style={{ height: slotHeight }}>
                    {isHour && (
                      <span className={isCompactTerm ? "-mt-1 text-xs" : "-mt-2"}>
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
                <div key={day} className="relative border-l border-border" style={{ height: halfHourRows * slotHeight }}>
                  {Array.from({ length: halfHourRows }, (_, i) => (
                    <div key={i} className={`absolute left-0 right-0 border-b ${i % 2 === 0 ? "border-border" : "border-border/30"}`} style={{ top: i * slotHeight }} />
                  ))}
                  {dayBlocks.map((block, idx) => {
                    const topCompact = (block.startTime - startHour) * 2 * slotHeight
                    const heightCompact = (block.endTime - block.startTime) * 2 * slotHeight
                    const color = COURSE_COLORS[block.colorIndex]
                    const hasConflict = conflicts.has(block.item.id)
                    return (
                      <div
                        key={`${block.item.id}-${idx}`}
                        data-schedule-item-id={block.item.id}
                        data-schedule-course-code={block.item.courseCode}
                        className={`absolute left-1 right-1 rounded-md border overflow-hidden ${color.bg} ${color.border} ${color.text} ${hasConflict ? "ring-2 ring-destructive" : ""} ${isCompactTerm ? "px-1.5 py-1" : "px-2 py-1"} ${showTapDetails ? "cursor-pointer" : ""}`}
                        style={{ top: topCompact, height: heightCompact }}
                        role={showTapDetails ? "button" : undefined}
                        tabIndex={showTapDetails ? 0 : undefined}
                        aria-label={showTapDetails ? `View details for ${block.item.courseCode}` : undefined}
                        onClick={showTapDetails ? () => setActiveBlock(block) : undefined}
                        onKeyDown={showTapDetails ? (event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault()
                            setActiveBlock(block)
                          }
                        } : undefined}
                      >
                        <p className={`font-bold truncate ${isCompactTerm ? "text-xs" : "text-xs"}`}>{block.item.courseCode}</p>
                        <p className={`truncate ${isCompactTerm && isMobile ? "text-[11px]" : "text-[0.625rem]"}`}>{block.item.typeLabel}</p>
                        {heightCompact > 50 && <p className={`truncate opacity-75 ${isCompactTerm && isMobile ? "text-[11px]" : "text-[0.625rem]"}`}>{block.item.location}</p>}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className={`${isCompactTerm ? "mt-2 pt-2" : "mt-4 pt-3"} border-t border-border flex flex-wrap gap-3`}>
        {Object.entries(courseColorMap).map(([code, colorIdx]) => (
          <div key={code} className={`flex items-center ${isCompactTerm ? "gap-1" : "gap-2"}`}>
            <div className={`rounded border ${COURSE_COLORS[colorIdx].bg} ${COURSE_COLORS[colorIdx].border} ${isCompactTerm ? "w-3 h-3" : "w-4 h-4"}`} />
            <span className="text-xs font-medium">{code}</span>
          </div>
        ))}
      </div>

      <Dialog open={activeBlock !== null} onOpenChange={(open) => !open && setActiveBlock(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{activeBlock?.item.courseCode}</DialogTitle>
            <DialogDescription>
              Full class details
            </DialogDescription>
          </DialogHeader>
          {activeBlock && (
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Component:</span> {activeBlock.item.typeLabel}</p>
              <p><span className="font-medium">Section:</span> {activeBlock.item.section}</p>
              <p><span className="font-medium">Day:</span> {activeBlock.item.day}</p>
              <p><span className="font-medium">Time:</span> {activeBlock.item.time}</p>
              <p><span className="font-medium">Location:</span> {activeBlock.item.location}</p>
              <p><span className="font-medium">Instructor:</span> {activeBlock.item.instructor}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function CartPage() {
  const [isEmbeddedPreview, setIsEmbeddedPreview] = useState(false)
  const { items, removeItem, clearCart } = useCart()
  const scheduleRef = useRef<HTMLDivElement>(null)
  const previousItemsRef = useRef<CartItem[]>([])
  const hasInitializedChangeTrackingRef = useRef(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    const params = new URLSearchParams(window.location.search)
    setIsEmbeddedPreview(params.get("embed") === "1")
  }, [])

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
    const rawTerm = item.term || ""
    const normalizedTerm = normalizeTerm(rawTerm) || "unspecified"
    const duration = getTermDuration(rawTerm) ?? getTermDuration(normalizedTerm)
    let term = normalizedTerm

    if (normalizedTerm !== "year" && duration) {
      const startMonth = normalizeMonthName(duration.start)
      const endMonth = normalizeMonthName(duration.end)
      if (startMonth === "sep" && endMonth === "apr") {
        term = "year"
      } else if (["sep", "oct", "nov", "dec"].includes(startMonth)) {
        term = "fall"
      } else if (["jan", "feb", "mar", "apr"].includes(startMonth)) {
        term = "winter"
      } else if (["may", "jun", "jul", "aug"].includes(startMonth)) {
        term = "summer"
      }
    }
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
  const knownTermOrder = ["fall", "winter", "summer", "summer1", "summer2"]
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

  const handleSaveAsPdf = async () => {
    if (!scheduleRef.current) return
    const { default: html2canvas } = await import("html2canvas-pro")
    const { jsPDF } = await import("jspdf")

    // Create PDF in landscape A4
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    })
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 8
    const headerHeight = 12
    const websiteText = "yuplan.ca"
    const websiteUrl = "https://yuplan.ca"

    const logoDataUrl = await new Promise<string | null>((resolve) => {
      const image = new Image()
      image.crossOrigin = "anonymous"
      image.onload = () => {
        const canvas = document.createElement("canvas")
        canvas.width = image.naturalWidth
        canvas.height = image.naturalHeight
        const context = canvas.getContext("2d")
        if (!context) {
          resolve(null)
          return
        }
        context.drawImage(image, 0, 0)
        resolve(canvas.toDataURL("image/png"))
      }
      image.onerror = () => resolve(null)
      image.src = Logo.src
    })

    const drawPdfHeader = () => {
      if (logoDataUrl) {
        const logoHeight = 5.5
        const logoWidth = 20
        pdf.addImage(logoDataUrl, "PNG", margin, margin, logoWidth, logoHeight)
      }

      pdf.setFontSize(10)
      pdf.setTextColor(37, 99, 235)
      const websiteX = pageWidth - margin - pdf.getTextWidth(websiteText)
      pdf.textWithLink(websiteText, websiteX, margin + 4.5, { url: websiteUrl })
      pdf.setDrawColor(220, 220, 220)
      pdf.line(margin, margin + headerHeight - 2, pageWidth - margin, margin + headerHeight - 2)
      pdf.setTextColor(0, 0, 0)
    }

    const renderSchedulePage = async (element: HTMLElement) => {
      if (pageCount > 0) pdf.addPage()

      const canvas = await html2canvas(element, {
        scale: 1.5,
        useCORS: true,
        backgroundColor: "#ffffff",
      })

      drawPdfHeader()

      const imgData = canvas.toDataURL("image/jpeg", 0.8)
      const availableW = pageWidth - margin * 2
      const contentTop = margin + headerHeight
      const availableH = pageHeight - contentTop - margin
      const imgRatio = canvas.width / canvas.height
      let drawW = availableW
      let drawH = drawW / imgRatio

      if (drawH > availableH) {
        drawH = availableH
        drawW = drawH * imgRatio
      }

      const offsetX = margin + (availableW - drawW) / 2
      const offsetY = contentTop + (availableH - drawH) / 2
      pdf.addImage(imgData, "JPEG", offsetX, offsetY, drawW, drawH)
      pageCount++
    }

    // Check if fall and winter are displayed side-by-side
    const fallWinterGrid = scheduleRef.current.querySelector<HTMLElement>(".fall-winter-grid")
    let pageCount = 0

    // If fall/winter grid exists, render it as one page
    if (fallWinterGrid) {
      await renderSchedulePage(fallWinterGrid)
    }

    // Find all other term schedules (not fall/winter)
    const allTermElements = scheduleRef.current.querySelectorAll<HTMLElement>("[data-term-schedule]")
    for (const termEl of allTermElements) {
      const termKey = termEl.getAttribute("data-term-schedule")
      if (fallWinterGrid && (termKey === "fall" || termKey === "winter")) continue // Skip only when fall/winter combined grid was rendered

      await renderSchedulePage(termEl)
    }

    pdf.save("YUPlan-Schedule.pdf")
  }

  useEffect(() => {
    if (!isEmbeddedPreview) {
      previousItemsRef.current = items
      return
    }

    if (!hasInitializedChangeTrackingRef.current) {
      hasInitializedChangeTrackingRef.current = true
      previousItemsRef.current = items
      return
    }

    const previousItems = previousItemsRef.current
    const previousIds = new Set(previousItems.map((item) => item.id))
    const currentIds = new Set(items.map((item) => item.id))

    const addedItems = items.filter((item) => !previousIds.has(item.id))
    const removedItems = previousItems.filter((item) => !currentIds.has(item.id))

    const scheduleElement = scheduleRef.current
    if (!scheduleElement) {
      previousItemsRef.current = items
      return
    }

    const scheduleBlocks = Array.from(scheduleElement.querySelectorAll<HTMLElement>("[data-schedule-item-id]"))

    const findBlockByItemId = (itemId: string) =>
      scheduleBlocks.find((element) => element.getAttribute("data-schedule-item-id") === itemId) ?? null

    const findBlockByCourseCode = (courseCode: string) =>
      scheduleBlocks.find((element) => element.getAttribute("data-schedule-course-code") === courseCode) ?? null

    let targetBlock: HTMLElement | null = null

    for (const item of addedItems) {
      const match = findBlockByItemId(item.id)
      if (match) {
        targetBlock = match
        break
      }
    }

    if (!targetBlock && removedItems.length > 0) {
      targetBlock = findBlockByCourseCode(removedItems[0].courseCode)
    }

    if (targetBlock) {
      targetBlock.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" })
    }

    previousItemsRef.current = items
  }, [items, isEmbeddedPreview])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {!isEmbeddedPreview && <Header showSearch />}
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 flex-1 w-full">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          {!isEmbeddedPreview && (
            <motion.div
              className="mb-8"
              initial="initial"
              animate="animate"
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp}>
                <Link href="/courses" className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block">
                  ← Back to courses
                </Link>
              </motion.div>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <motion.div variants={fadeInUp}>
                  <h1 className="text-3xl sm:text-4xl font-bold mb-2">Your Cart</h1>
                  <p className="text-muted-foreground">
                    {items.length === 0
                      ? "Your cart is empty. Add sections from a course page."
                      : `${courseList.length} course${courseList.length === 1 ? "" : "s"} across ${orderedTerms.length} term${orderedTerms.length === 1 ? "" : "s"}`}
                  </p>
                </motion.div>
                {items.length > 0 && (
                  <motion.div
                    className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full sm:w-auto"
                    variants={fadeInUp}
                  >
                    <Button variant="outline" size="sm" onClick={clearCart} className="w-full sm:w-auto">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear Cart
                    </Button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* Empty State */}
          {items.length === 0 && (
            <motion.div
              initial="initial"
              animate="animate"
              variants={fadeInUp}
            >
              <Card className="p-6 sm:p-12 text-center">
                <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-semibold mb-2">No courses in your cart</h2>
                <p className="text-muted-foreground mb-6">
                  Browse courses and add them to cart to start building your schedule.
                </p>
                <Link href="/courses">
                  <Button>Browse Courses</Button>
                </Link>
              </Card>
            </motion.div>
          )}

          {/* Conflict Warning */}
          {allConflicts.size > 0 && items.length > 0 && (
            <motion.div
              initial="initial"
              animate="animate"
              variants={fadeInUp}
            >
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
            </motion.div>
          )}

          {/* Schedule Timetables first in embedded preview */}
          {isEmbeddedPreview && items.length > 0 && (
            <motion.div
              className="mb-8"
              initial="initial"
              animate="animate"
              variants={staggerContainer}
            >
              <motion.div className="mb-4" variants={fadeInUp}>
                <h2 className="text-xl sm:text-2xl font-bold">Your Schedule</h2>
              </motion.div>

              <div ref={scheduleRef} className="space-y-8">
                {/* Fall and Winter side-by-side if both exist */}
                {orderedTerms.includes("fall") && orderedTerms.includes("winter") && (
                  <motion.div
                    className="fall-winter-grid grid grid-cols-1 lg:grid-cols-2 gap-4"
                    variants={cardVariant}
                  >
                    <ScheduleTimetable
                      termItems={itemsByTerm["fall"]}
                      termKey="fall"
                      conflicts={conflictsByTerm["fall"]}
                      globalColorMap={globalColorMap}
                    />
                    <ScheduleTimetable
                      termItems={itemsByTerm["winter"]}
                      termKey="winter"
                      conflicts={conflictsByTerm["winter"]}
                      globalColorMap={globalColorMap}
                    />
                  </motion.div>
                )}

                {/* Individual schedules for standalone or other terms */}
                {orderedTerms.map((term) => {
                  // Skip if we already rendered fall/winter together
                  if ((term === "fall" || term === "winter") && orderedTerms.includes("fall") && orderedTerms.includes("winter")) {
                    return null
                  }
                  return (
                    <motion.div key={term} variants={cardVariant}>
                      <ScheduleTimetable
                        termItems={itemsByTerm[term]}
                        termKey={term}
                        conflicts={conflictsByTerm[term]}
                        globalColorMap={globalColorMap}
                      />
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* Embedded preview actions right after schedule */}
          {isEmbeddedPreview && items.length > 0 && (
            <motion.div
              className="mb-8 flex flex-col gap-2"
              initial="initial"
              animate="animate"
              variants={fadeInUp}
            >
              <Button variant="outline" size="sm" onClick={handleSaveAsPdf} className="w-full shadow-md shadow-primary">
                <Download className="h-4 w-4 mr-2" />
                Save as PDF
              </Button>
              <Button variant="outline" size="sm" onClick={clearCart} className="w-full">
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Cart
              </Button>
            </motion.div>
          )}

          {/* Selection Review (before schedule generation) */}
          {orderedTerms.length > 0 && (
            <motion.div
              className="space-y-6 mb-8"
              initial="initial"
              animate="animate"
              variants={staggerContainer}
            >
              {orderedTerms.map((term) => {
                const termItems = itemsByTerm[term]
                const termInfo = getTermDisplayInfo(term)
                const termGrouped: Record<string, CartItem[]> = {}
                for (const item of termItems) {
                  if (!termGrouped[item.courseCode]) termGrouped[item.courseCode] = []
                  termGrouped[item.courseCode].push(item)
                }
                const termCourseList = Object.keys(termGrouped).sort((a, b) => a.localeCompare(b))
                const termConflictCount = termItems.filter((item) => allConflicts.has(item.id)).length

                return (
                  <motion.div key={term} variants={cardVariant}>
                    <Card className="overflow-hidden">
                    <div className="p-4 md:p-5 bg-muted/40 border-b border-border">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg md:text-xl font-bold">{termInfo.label}</h2>
                        {termInfo.period && <Badge variant="secondary">{termInfo.period}</Badge>}
                        <Badge variant="outline">{termCourseList.length} course{termCourseList.length !== 1 && "s"}</Badge>
                        {termConflictCount > 0 && (
                          <Badge variant="destructive" className="ml-auto">
                            <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                            {termConflictCount} conflict{termConflictCount !== 1 && "s"}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <Accordion type="multiple" className="px-4 md:px-5">
                      {termCourseList.map((courseCode) => {
                        const courseItems = termGrouped[courseCode]
                        const first = courseItems[0]
                        const sortedCourseItems = [...courseItems].sort((a, b) => {
                          const rankDiff = getComponentSortRank(a.type) - getComponentSortRank(b.type)
                          if (rankDiff !== 0) return rankDiff
                          if (a.section !== b.section) return a.section.localeCompare(b.section)
                          return a.typeLabel.localeCompare(b.typeLabel)
                        })

                        return (
                          <AccordionItem key={courseCode} value={`${term}-${courseCode}`}>
                            <div className="pt-4 pb-1 min-w-0 flex items-start gap-3">
                              <div className="min-w-0 flex-1">
                                <Link
                                  href={`/course/${courseCode.toLowerCase().replace(/\s+/g, "")}`}
                                  className="text-base font-semibold text-primary hover:underline truncate block"
                                >
                                  {courseCode}
                                </Link>
                                <p className="text-sm text-muted-foreground truncate">{first.courseName}</p>
                                {first.term && (
                                  <div className="mt-2">
                                    <MonthRangeBar
                                      termLabel={first.term}
                                      compact
                                      showLabel
                                      activeClassName={`${COURSE_COLORS[globalColorMap[courseCode] ?? 0].bg} ${COURSE_COLORS[globalColorMap[courseCode] ?? 0].text}`}
                                    />
                                  </div>
                                )}
                              </div>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Remove {courseCode}</span>
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Remove {courseCode}?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will remove all selected components for this course from your cart.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => {
                                        for (const courseItem of courseItems) {
                                          removeItem(courseItem.id)
                                        }
                                      }}
                                    >
                                      Remove course
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>

                            <AccordionTrigger className="hover:no-underline py-2 text-xs text-muted-foreground">
                              Show course components
                            </AccordionTrigger>

                            <AccordionContent>
                              <div className="space-y-2">
                                {sortedCourseItems.map((item) => (
                                  <div key={item.id} className="p-3 rounded-md border border-border bg-background flex items-start gap-3">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                        <Badge variant="outline" className="text-xs">Section {item.section}</Badge>
                                        <Badge variant="secondary" className="text-xs">{item.typeLabel}</Badge>
                                        {allConflicts.has(item.id) && (
                                          <Badge variant="destructive" className="text-xs">
                                            <AlertTriangle className="h-3 w-3 mr-1" />
                                            Conflict
                                          </Badge>
                                        )}
                                      </div>

                                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
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

                                    {(() => {
                                      const isPrimaryComponent = PRIMARY_COMPONENT_TYPES.has(normalizeComponentType(item.type))
                                      const hasSecondaryInSameSection = courseItems.some(
                                        (entry) =>
                                          entry.section === item.section &&
                                          SECONDARY_COMPONENT_TYPES.has(normalizeComponentType(entry.type)),
                                      )
                                      const canRemove = !(isPrimaryComponent && hasSecondaryInSameSection)

                                      if (!canRemove) return null

                                      return (
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                          onClick={() => removeItem(item.id)}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                          <span className="sr-only">Remove {item.typeLabel}</span>
                                        </Button>
                                      )
                                    })()}
                                  </div>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        )
                      })}
                    </Accordion>
                    </Card>
                  </motion.div>
                )
              })}
            </motion.div>
          )}

          {/* Schedule Timetables - one per term */}
          {!isEmbeddedPreview && items.length > 0 && (
            <motion.div
              className="mb-8"
              initial="initial"
              animate="animate"
              variants={staggerContainer}
            >
              <motion.div
                className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4"
                variants={fadeInUp}
              >
                <h2 className="text-xl sm:text-2xl font-bold">Your Schedule</h2>
                <Button variant="outline" size="sm" onClick={handleSaveAsPdf} className="w-full sm:w-auto shadow-md shadow-primary">
                  <Download className="h-4 w-4 mr-2" />
                  Save as PDF
                </Button>
              </motion.div>

              <div ref={scheduleRef} className="space-y-8">
                {/* Fall and Winter side-by-side if both exist */}
                {orderedTerms.includes("fall") && orderedTerms.includes("winter") && (
                  <motion.div
                    className="fall-winter-grid grid grid-cols-1 lg:grid-cols-2 gap-4"
                    variants={cardVariant}
                  >
                    <ScheduleTimetable
                      termItems={itemsByTerm["fall"]}
                      termKey="fall"
                      conflicts={conflictsByTerm["fall"]}
                      globalColorMap={globalColorMap}
                    />
                    <ScheduleTimetable
                      termItems={itemsByTerm["winter"]}
                      termKey="winter"
                      conflicts={conflictsByTerm["winter"]}
                      globalColorMap={globalColorMap}
                    />
                  </motion.div>
                )}

                {/* Individual schedules for standalone or other terms */}
                {orderedTerms.map((term) => {
                  // Skip if we already rendered fall/winter together
                  if ((term === "fall" || term === "winter") && orderedTerms.includes("fall") && orderedTerms.includes("winter")) {
                    return null
                  }
                  return (
                    <motion.div key={term} variants={cardVariant}>
                      <ScheduleTimetable
                        termItems={itemsByTerm[term]}
                        termKey={term}
                        conflicts={conflictsByTerm[term]}
                        globalColorMap={globalColorMap}
                      />
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}

        </div>
      </div>
      <Footer />
    </div>
  )
}
