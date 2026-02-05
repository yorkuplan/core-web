"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"

type BlurredHeroProps = {
  children: React.ReactNode
  className?: string
  contentClassName?: string
  imageSrc?: string
  imageAlt?: string
  imageClassName?: string
  /**
   * Overlay that tints the image red a bit.
   * Defaults are tuned to match the provided screenshots.
   */
  tintClassName?: string
  /**
   * Extra overlay to ensure text contrast on top.
   */
  contrastOverlayClassName?: string
  /**
   * Gradient fade at the bottom so the hero blends into the page background.
   */
  fadeClassName?: string
  priority?: boolean
}

export function BlurredHero({
  children,
  className,
  contentClassName,
  imageSrc = "/background-image.webp",
  imageAlt = "Background",
  imageClassName,
  contrastOverlayClassName,
  fadeClassName,
  priority = true,
}: BlurredHeroProps) {
  return (
    <section className={cn("relative isolate aspect-21/9", className)}>
      {/* Background is clipped, content can overflow (search dropdown) */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          priority={priority}
          sizes="100vw"
          decoding="async"
          className={cn(
            // scale avoids blur edges showing transparent borders
            "pointer-events-none select-none object-cover scale-110",
            imageClassName,
          )}
        />
        <div
          className={cn(
            // Combined overlay: contrast and fade in one layer
            "absolute inset-0 bg-linear-to-b from-black/10 via-black/10 to-background",
            contrastOverlayClassName,
            fadeClassName,
          )}
        />
      </div>

      <div className={cn("relative z-10", contentClassName)}>{children}</div>
    </section>
  )
}
