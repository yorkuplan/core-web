type TermDuration = { start: string; end: string }

const MONTH_INDEX: Record<string, number> = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,
}

const FW_MONTHS = new Set([8, 9, 10, 11, 0, 1, 2, 3]) // Sep-Apr
const SU_MONTHS = new Set([3, 4, 5, 6, 7]) // Apr-Aug

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

const TERM_CODE_KEYS = Object.keys(TERM_CODE_DURATION).sort(
  (a, b) => b.length - a.length,
)

function normalizeMonthName(value: string): string {
  const normalized = value.trim().toLowerCase()
  return normalized.length <= 3 ? normalized : normalized.slice(0, 3)
}

function getMonthRange(startLabel: string, endLabel: string): Set<number> | null {
  const start = MONTH_INDEX[normalizeMonthName(startLabel)]
  const end = MONTH_INDEX[normalizeMonthName(endLabel)]
  if (start === undefined || end === undefined) return null

  const months = new Set<number>()
  if (start <= end) {
    for (let i = start; i <= end; i++) months.add(i)
  } else {
    for (let i = start; i < 12; i++) months.add(i)
    for (let i = 0; i <= end; i++) months.add(i)
  }
  return months
}

function extractTermCode(value: string): string | null {
  const normalized = value.toUpperCase()
  for (const code of TERM_CODE_KEYS) {
    if (new RegExp(`\\b${code}\\b`).test(normalized)) {
      return code
    }
  }
  return null
}

function getTermDuration(term: string): TermDuration | null {
  const normalized = term.trim().toLowerCase()

  if (/full\s*year/.test(normalized)) return TERM_CODE_DURATION.Y
  if (/\bfall\b/.test(normalized)) return TERM_CODE_DURATION.F
  if (/\bwinter\b/.test(normalized)) return TERM_CODE_DURATION.W
  if (/\bsummer\b/.test(normalized)) return { start: "May", end: "August" }

  const code = extractTermCode(term)
  if (code && TERM_CODE_DURATION[code]) {
    return TERM_CODE_DURATION[code]
  }

  return null
}

export function getTermBucket(term: string | undefined): "FW" | "SU" | null {
  if (!term) return null

  const normalized = term.trim().toUpperCase()
  if (["F", "W", "Y", "FW"].includes(normalized)) return "FW"
  if (["S", "SU", "S1", "S2"].includes(normalized)) return "SU"

  const duration = getTermDuration(term)
  if (!duration) return null

  const months = getMonthRange(duration.start, duration.end)
  if (!months || months.size === 0) return null

  let withinFw = true
  let withinSu = true

  for (const month of months) {
    if (!FW_MONTHS.has(month)) withinFw = false
    if (!SU_MONTHS.has(month)) withinSu = false
  }

  if (withinSu) return "SU"
  if (withinFw) return "FW"

  // Fallback for ranges that overlap both sets: if it touches Sep-Mar, treat as FW.
  const touchesFwCore = [8, 9, 10, 11, 0, 1, 2].some((m) => months.has(m))
  if (touchesFwCore) return "FW"

  const touchesSuCore = [4, 5, 6, 7].some((m) => months.has(m))
  if (touchesSuCore) return "SU"

  return null
}
