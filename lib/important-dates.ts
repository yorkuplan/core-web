export type ImportantDate = {
  title: string
  startsOn: string
  dateLabel: string
  term: string
  kind: "Deadline" | "Closure"
}

const IMPORTANT_DATES_SOURCE = [
  {
    title: "Drop deadline (no grade) closes",
    startsOn: "2026-03-09",
    dateLabel: "March 9, 2026",
    term: "Winter",
    kind: "Deadline",
  },
  {
    title: "Course withdrawal period begins",
    startsOn: "2026-03-10",
    dateLabel: "March 10, 2026",
    term: "Winter",
    kind: "Deadline",
  },
  {
    title: "Good Friday (University closed)",
    startsOn: "2026-04-03",
    dateLabel: "April 3, 2026",
    term: "University",
    kind: "Closure",
  },
  {
    title: "Winter classes end",
    startsOn: "2026-04-06",
    dateLabel: "April 6, 2026",
    term: "Winter",
    kind: "Deadline",
  },
  {
    title: "Winter study day",
    startsOn: "2026-04-07",
    dateLabel: "April 7, 2026",
    term: "Winter",
    kind: "Deadline",
  },
  {
    title: "Winter examinations begin",
    startsOn: "2026-04-08",
    dateLabel: "April 8, 2026",
    term: "Winter",
    kind: "Deadline",
  },
  {
    title: "Summer SU / S1 classes start",
    startsOn: "2026-05-04",
    dateLabel: "May 4, 2026",
    term: "Summer SU",
    kind: "Deadline",
  },
  {
    title: "Last date to add (SU / S1)",
    startsOn: "2026-05-11",
    dateLabel: "May 11, 2026",
    term: "Summer SU",
    kind: "Deadline",
  },
  {
    title: "Victoria Day (University closed)",
    startsOn: "2026-05-18",
    dateLabel: "May 18, 2026",
    term: "University",
    kind: "Closure",
  },
  {
    title: "Last date to drop without grade (S1)",
    startsOn: "2026-06-01",
    dateLabel: "June 1, 2026",
    term: "Summer S1",
    kind: "Deadline",
  },
  {
    title: "Summer reading week (SU)",
    startsOn: "2026-06-16",
    dateLabel: "June 16, 2026",
    term: "Summer SU",
    kind: "Deadline",
  },
  {
    title: "Summer S2 classes start",
    startsOn: "2026-06-22",
    dateLabel: "June 22, 2026",
    term: "Summer S2",
    kind: "Deadline",
  },
  {
    title: "Canada Day (University closed)",
    startsOn: "2026-07-01",
    dateLabel: "July 1, 2026",
    term: "University",
    kind: "Closure",
  },
  {
    title: "Civic Holiday (University closed)",
    startsOn: "2026-08-03",
    dateLabel: "August 3, 2026",
    term: "University",
    kind: "Closure",
  },
  {
    title: "Labour Day (University closed)",
    startsOn: "2026-09-07",
    dateLabel: "September 7, 2026",
    term: "University",
    kind: "Closure",
  },
  {
    title: "Thanksgiving Day (University closed)",
    startsOn: "2026-10-12",
    dateLabel: "October 12, 2026",
    term: "University",
    kind: "Closure",
  },
  {
    title: "Winter break begins",
    startsOn: "2026-12-24",
    dateLabel: "December 24, 2026",
    term: "University",
    kind: "Closure",
  },
  {
    title: "Winter break ends",
    startsOn: "2027-01-02",
    dateLabel: "January 2, 2027",
    term: "University",
    kind: "Closure",
  },
  {
    title: "Family Day (University closed)",
    startsOn: "2027-02-15",
    dateLabel: "February 15, 2027",
    term: "University",
    kind: "Closure",
  },
  {
    title: "Good Friday (University closed)",
    startsOn: "2027-03-26",
    dateLabel: "March 26, 2027",
    term: "University",
    kind: "Closure",
  },
] satisfies ImportantDate[]

export const IMPORTANT_DATES: ImportantDate[] = [...IMPORTANT_DATES_SOURCE].sort(
  (a, b) => new Date(a.startsOn).getTime() - new Date(b.startsOn).getTime(),
)
