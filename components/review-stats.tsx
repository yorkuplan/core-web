"use client"

import { Card } from "@/components/ui/card"
import { Star } from "lucide-react"
import type { ReviewStats as ReviewStatsType } from "@/lib/api/courses"

interface ReviewStatsProps {
  stats: ReviewStatsType
}

export function ReviewStats({ stats }: ReviewStatsProps) {
  return (
    <Card className="p-4 sm:p-6 mb-4 sm:mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 sm:gap-6">
        {/* Like Percentage - Large Display */}
        <div className="flex-shrink-0">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-bold">
              {Math.round(stats.like_percentage)}%
            </span>
            <span className="text-sm sm:text-base text-muted-foreground">
              liked this course
            </span>
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground mt-1">
            Based on {stats.total_reviews}{" "}
            {stats.total_reviews === 1 ? "review" : "reviews"}
          </div>
        </div>

        {/* Difficulty and Relevance */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
          <div>
            <div className="text-xs sm:text-sm text-muted-foreground mb-1.5 sm:mb-2">
              Difficulty
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <Star
                  key={value}
                  className={`h-4 w-4 sm:h-5 sm:w-5 ${
                    value <= Math.round(stats.avg_difficulty)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300 dark:text-gray-600"
                  }`}
                />
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs sm:text-sm text-muted-foreground mb-1.5 sm:mb-2">
              Real-World Relevance
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <Star
                  key={value}
                  className={`h-4 w-4 sm:h-5 sm:w-5 ${
                    value <= Math.round(stats.avg_real_world_relevance)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300 dark:text-gray-600"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
