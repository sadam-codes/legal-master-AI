import * as React from "react";
import { Button } from "./button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PaginationProps extends React.HTMLAttributes<HTMLDivElement> {
  totalItems: number;
  pageSize: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
}

export function Pagination({
  totalItems,
  pageSize,
  currentPage,
  onPageChange,
  siblingCount = 1,
  className,
  ...props
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / pageSize);

  // Generate page numbers array with ellipsis
  const getPageNumbers = () => {
    const totalNumbers = siblingCount * 2 + 3; // siblings on both sides + first + last + current
    const totalBlocks = totalNumbers + 2; // +2 for ellipsis

    if (totalPages <= totalBlocks) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      return [
        ...Array.from({ length: leftItemCount }, (_, i) => i + 1),
        "...",
        totalPages,
      ];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      return [
        1,
        "...",
        ...Array.from(
          { length: rightItemCount },
          (_, i) => totalPages - rightItemCount + i + 1
        ),
      ];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      return [
        1,
        "...",
        ...Array.from(
          { length: rightSiblingIndex - leftSiblingIndex + 1 },
          (_, i) => leftSiblingIndex + i
        ),
        "...",
        totalPages,
      ];
    }

    return [];
  };

  const pages = getPageNumbers();

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-1 py-4 w-full",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          aria-label="Go to first page"
          className="h-8 w-8"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Go to previous page"
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center">
        {pages.map((page, i) => {
          if (page === "...") {
            return (
              <span
                key={`ellipsis-${i}`}
                className="px-3 py-2 text-sm text-muted-foreground"
              >
                ...
              </span>
            );
          }

          return (
            <Button
              key={`page-${page}`}
              onClick={() => onPageChange(page as number)}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              className={cn(
                "h-8 w-8",
                currentPage === page && "pointer-events-none"
              )}
            >
              {page}
            </Button>
          );
        })}
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Go to next page"
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          aria-label="Go to last page"
          className="h-8 w-8"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function PaginationInfo({
  totalItems,
  pageSize,
  currentPage,
  className,
}: {
  totalItems: number;
  pageSize: number;
  currentPage: number;
  className?: string;
}) {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div
      className={cn(
        "text-sm text-muted-foreground flex items-center justify-end",
        className
      )}
    >
      Showing {totalItems > 0 ? startItem : 0}-{endItem} of {totalItems} items
    </div>
  );
} 