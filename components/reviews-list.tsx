"use client"

import { Card } from "@/components/ui/card"
import { Star, ThumbsUp, ThumbsDown } from "lucide-react"
import type { Review } from "@/lib/api/courses"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createAvatar } from "@dicebear/core"
import { thumbs } from "@dicebear/collection"

interface ReviewsListProps {
  reviews: Review[]
}

export function ReviewsList({ reviews }: ReviewsListProps) {
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffSecs / 60)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)
    const diffWeeks = Math.floor(diffDays / 7)
    const diffMonths = Math.floor(diffDays / 30)
    const diffYears = Math.floor(diffDays / 365)

    if (diffYears > 0)
      return `${diffYears} ${diffYears === 1 ? "year" : "years"} ago`
    if (diffMonths > 0)
      return `${diffMonths} ${diffMonths === 1 ? "month" : "months"} ago`
    if (diffWeeks > 0)
      return `${diffWeeks} ${diffWeeks === 1 ? "week" : "weeks"} ago`
    if (diffDays > 0)
      return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`
    if (diffHours > 0)
      return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`
    if (diffMins > 0)
      return `${diffMins} ${diffMins === 1 ? "minute" : "minutes"} ago`
    return "just now"
  }

  const getAuthorDisplay = (authorName: string | null): string => {
    if (!authorName) {
      return "Anonymous review"
    }
    return authorName
  }

  const getInitials = (name: string): string => {
    const words = name.split(" ")
    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  const getAvatarUrl = (
    reviewId: string,
    authorName: string | null,
  ): string => {
    // Use review ID as seed for consistent, random-looking avatars
    const seed = reviewId
    const avatar = createAvatar(thumbs, {
      seed,
      size: 128,
    })
    return avatar.toDataUri()
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No reviews yet. Be the first to review this course!
      </div>
    )
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {reviews.map((review) => {
        const authorDisplay = getAuthorDisplay(review.author_name)

        return (
          <Card key={review.id} className="p-4 sm:p-6">
            <div className="flex gap-3 sm:gap-4 items-start">
              {/* Avatar */}
              <Avatar className="h-8 w-8 sm:h-10 sm:w-10 shrink-0 mt-0.5">
                <AvatarImage
                  src={getAvatarUrl(review.id, review.author_name)}
                  alt={authorDisplay}
                />
                <AvatarFallback className="bg-primary/10 text-primary text-xs sm:text-sm">
                  {review.author_name ? getInitials(review.author_name) : "AN"}
                </AvatarFallback>
              </Avatar>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Stacked on mobile, side-by-side on desktop */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between sm:gap-4 mb-2">
                  {/* Review Text */}
                  <div className="flex-1 min-w-0 mb-3 sm:mb-0">
                    <p className="text-sm sm:text-base leading-relaxed">
                      {review.review_text}
                    </p>
                  </div>

                  {/* Ratings - Below on mobile, right side on desktop */}
                  <div className="flex flex-col shrink-0 sm:items-end">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        Difficulty
                      </span>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <Star
                            key={value}
                            className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${
                              value <= review.difficulty
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300 dark:text-gray-600"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        Real-World Relevance
                      </span>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <Star
                            key={value}
                            className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${
                              value <= review.real_world_relevance
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300 dark:text-gray-600"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        Opinion
                      </span>
                      {review.liked ? (
                        <div className="flex items-center gap-1 text-green-600 dark:text-green-500">
                          <ThumbsUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-current" />
                          <span className="text-xs font-medium">
                            Liked this course
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-red-600 dark:text-red-500">
                          <ThumbsDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-current" />
                          <span className="text-xs font-medium">
                            Disliked this course
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
                  <span>— {authorDisplay}</span>
                  <span className="text-muted-foreground/60">•</span>
                  <span>{formatTimeAgo(review.created_at)}</span>
                </div>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
