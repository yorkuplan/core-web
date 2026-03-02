"use client";

import { Menu, Search, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { CartButton } from "@/components/cart-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { coursesApi, type Course, formatCourseCode } from "@/lib/api/courses";
import Logo from "@/public/logo.webp";
import { createPortal } from "react-dom";

const normalizeCode = (code: string) => code.replace(/\s+/g, "").toUpperCase();

const dedupeCourses = (items: Course[]) => {
  const seen = new Set<string>();
  return items.filter((course) => {
    const key = normalizeCode(course.code || "");
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

interface HeaderProps {
  subtitle?: string;
  showSearch?: boolean;
  centerContent?: React.ReactNode;
  /** Rendered in the right group on mobile only (e.g. search icon). When set, center is hidden on mobile. */
  rightSlotMobile?: React.ReactNode;
}

export function Header({
  subtitle,
  showSearch = false,
  centerContent,
  rightSlotMobile,
}: HeaderProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Course[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!showSearch) return;

    if (!query.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    const timeout = setTimeout(async () => {
      setShowDropdown(true);
      setIsSearching(true);
      setResults([]);

      try {
        const list = await coursesApi.searchCourses(query);
        const deduped = Array.isArray(list) ? dedupeCourses(list) : [];
        setResults(deduped);
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, showSearch]);

  useEffect(() => {
    if (!showSearch || !mobileSearchOpen) return;

    document.body.style.overflow = "hidden";
    const timeout = setTimeout(() => mobileInputRef.current?.focus(), 100);

    return () => {
      document.body.style.overflow = "";
      clearTimeout(timeout);
    };
  }, [mobileSearchOpen, showSearch]);

  const resetSearchState = () => {
    setQuery("");
    setResults([]);
    setShowDropdown(false);
    setMobileSearchOpen(false);
  };

  const goToCourse = (course: Course) => {
    const slug = course.code?.replace(/\s+/g, "").toLowerCase();
    if (slug) router.push(`/course/${slug}`);
    resetSearchState();
  };

  const goToSearchPage = (value: string) => {
    const trimmed = value.trim();
    if (trimmed) {
      router.push(`/courses?q=${encodeURIComponent(trimmed)}`);
    }
    resetSearchState();
  };

  const desktopSearch = (
    <div className="relative flex-1 w-full min-w-0 max-w-md mx-auto hidden md:block">
      <div className="relative">
        <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 sm:h-5 w-4 sm:w-5 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          placeholder="Search courses..."
          className="pl-9 sm:pl-12 pr-8 sm:pr-10 h-9 sm:h-10 bg-card text-sm w-full"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => query.trim() && setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              goToSearchPage(query);
            }
          }}
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {showDropdown && query.trim() && (
        <Card
          className="absolute top-full left-0 right-0 z-50 mt-2 max-h-[min(50vh,320px)] overflow-y-auto shadow-xl border-border bg-card text-left"
          onMouseDown={(event) => event.preventDefault()}
        >
          {isSearching ? (
            <div className="p-4 text-muted-foreground text-sm">Searching...</div>
          ) : results.length === 0 ? (
            <div className="p-4 text-muted-foreground text-sm">
              No courses found for &quot;{query}&quot;
            </div>
          ) : (
            <div className="divide-y divide-border">
              {results.map((course) => (
                <button
                  key={course.id}
                  type="button"
                  className="w-full block p-3 sm:p-4 hover:bg-muted/70 transition-colors text-left"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => goToCourse(course)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-foreground text-sm">
                        {formatCourseCode(course.code)}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {course.name}
                      </p>
                    </div>
                    <Badge variant="secondary" className="shrink-0 text-xs">
                      {course.credits} credit{course.credits === 1 ? "" : "s"}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );

  const mobileSearchOverlay = mobileSearchOpen && (
    <div
      className="fixed inset-0 z-9999 md:hidden"
      onClick={() => {
        setMobileSearchOpen(false);
        setQuery("");
      }}
    >
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

      <div
        className="absolute top-0 left-0 right-0 bg-background border-b border-border shadow-2xl max-h-[70vh] flex flex-col"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-3 p-4 border-b border-border shrink-0">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              ref={mobileInputRef}
              type="text"
              placeholder="Search courses..."
              className="pl-10 pr-10 h-10 bg-muted border-0 shadow-none focus-visible:ring-2 focus-visible:ring-ring w-full text-base"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  goToSearchPage(query);
                }
              }}
            />
            {query && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setQuery("");
                  mobileInputRef.current?.focus();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setMobileSearchOpen(false);
              setQuery("");
            }}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
            aria-label="Close search"
          >
            Done
          </button>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 w-full">
          {isSearching && query.trim() ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-pulse p-4 rounded-full bg-muted/50 mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">Searching...</p>
            </div>
          ) : query.trim() === "" ? (
            <div className="flex flex-col items-center justify-center text-center px-6 py-12">
              <div className="p-4 rounded-full bg-muted/50 mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Search for courses by code or name
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center px-6 py-12">
              <div className="p-4 rounded-full bg-muted/50 mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium mb-1">No courses found</p>
              <p className="text-xs text-muted-foreground">
                Try searching with a different term
              </p>
            </div>
          ) : (
            <div className="w-full divide-y divide-border">
              {results.map((course) => (
                <button
                  key={course.id}
                  type="button"
                  className="block w-full p-4 text-left hover:bg-muted/50 active:bg-muted transition-colors"
                  onClick={() => goToCourse(course)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-sm mb-1">
                        {formatCourseCode(course.code)}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {course.name}
                      </p>
                    </div>
                    <Badge variant="secondary" className="shrink-0 text-xs mt-0.5">
                      {course.credits} credit{course.credits === 1 ? "" : "s"}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const center = showSearch
    ? desktopSearch
    : centerContent ??
      (subtitle ? (
        <p className="text-xs sm:text-sm text-muted-foreground text-center hidden md:block">
          {subtitle}
        </p>
      ) : null);

  const mobileRightSlot = showSearch ? (
    <button
      type="button"
      onClick={() => setMobileSearchOpen(true)}
      className="flex h-8 w-8 items-center justify-center rounded-md border border-input bg-card text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shadow-md shadow-primary md:hidden"
      aria-label="Search courses"
    >
      <Search className="h-4 w-4" />
    </button>
  ) : (
    rightSlotMobile
  );

  const showCenterOnMobile = !showSearch && Boolean(centerContent && !rightSlotMobile);

  return (
    <>
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 py-3 sm:py-4 relative">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <img
              src={Logo.src}
              alt="YUPlan - York University Course Planner"
              className="w-auto h-5 sm:h-6 lg:h-7 object-contain"
            />
          </Link>
          
          <div className="flex items-center gap-1.5 sm:gap-3 lg:gap-4 shrink-0">
            {mobileRightSlot && (
              <div className="md:hidden flex items-center shrink-0">
                {mobileRightSlot}
              </div>
            )}
            <nav className="hidden lg:flex items-center gap-4 text-sm">
              <Link
                href="/about"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Contact
              </Link>
            </nav>
            <Link href="/courses" className="hidden lg:block">
              <Button
                variant="outline"
                className="shadow-md shadow-primary text-xs sm:text-sm"
              >
                View All Courses
              </Button>
            </Link>
            <Link href="/courses" className="lg:hidden">
              <Button
                variant="outline"
                className="shadow-md shadow-primary text-xs px-2.5 sm:px-3 py-1 h-8"
              >
                All Courses
              </Button>
            </Link>
            <CartButton />
            <ThemeToggle />
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="lg:hidden shadow-md shadow-primary h-8 w-8"
                  aria-label="Open menu"
                >
                  <Menu className="size-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 sm:w-80">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-2 px-4">
                  <Link href="/about" className="w-full">
                    <Button variant="ghost" className="w-full justify-start">
                      About
                    </Button>
                  </Link>
                  <Link href="/contact" className="w-full">
                    <Button variant="ghost" className="w-full justify-start">
                      Contact
                    </Button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        
        {/* Absolutely positioned center content */}
        {center && (
          <div
            className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none ${!showCenterOnMobile ? "hidden md:block" : ""}`}
          >
            <div className="pointer-events-auto w-full max-w-xl">
              {center}
            </div>
          </div>
        )}
      </div>
      </header>

      {mounted && typeof document !== "undefined" && showSearch && mobileSearchOverlay && createPortal(mobileSearchOverlay, document.body)}
    </>
  );
}
