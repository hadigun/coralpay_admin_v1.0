// import { useMemo } from "react";

// export const DOTS = "...";

// const range = (start: number, end: number): number[] => {
//   let length = end - start + 1;
//   return Array.from({ length }, (_, idx) => idx + start);
// };

// interface UsePaginationProps {
//   totalCount: number;
//   pageSize: number;
//   siblingCount?: number;
//   currentPage: number;
// }

// export const usePagination = ({
//   totalCount,
//   pageSize,
//   siblingCount = 1,
//   currentPage,
// }: UsePaginationProps): (number | typeof DOTS)[] => {
//   const paginationRange = useMemo<(number | typeof DOTS)[]>(() => {
//     const totalPageCount = Math.ceil(totalCount / pageSize);
//     const totalPageNumbers = siblingCount + 5;

//     if (totalPageNumbers >= totalPageCount) {
//       return range(1, totalPageCount);
//     }

//     const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
//     const rightSiblingIndex = Math.min(
//       currentPage + siblingCount,
//       totalPageCount
//     );

//     const shouldShowLeftDots = leftSiblingIndex > 2;
//     const shouldShowRightDots = rightSiblingIndex < totalPageCount - 2;

//     const firstPageIndex = 1;
//     const lastPageIndex = totalPageCount;

//     if (!shouldShowLeftDots && shouldShowRightDots) {
//       let leftItemCount = 3 + 2 * siblingCount;
//       let leftRange = range(1, leftItemCount);
//       return [...leftRange, DOTS, lastPageIndex];
//     }

//     if (shouldShowLeftDots && !shouldShowRightDots) {
//       let rightItemCount = 3 + 2 * siblingCount;
//       let rightRange = range(
//         totalPageCount - rightItemCount + 1,
//         totalPageCount
//       );
//       return [firstPageIndex, DOTS, ...rightRange];
//     }

//     if (shouldShowLeftDots && shouldShowRightDots) {
//       let middleRange = range(leftSiblingIndex, rightSiblingIndex);
//       return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
//     }

//     // Fallback: always return an array
//     return [];
//   }, [totalCount, pageSize, siblingCount, currentPage]);

//   return paginationRange;
// };

import { useMemo } from "react";

export const DOTS = "..." as const;

const range = (start: number, end: number): number[] =>
  Array.from({ length: end - start + 1 }, (_, i) => i + start);

interface UsePaginationProps {
  totalCount: number;
  pageSize: number;
  currentPage: number;
  siblingCount?: number; // desktop only
  boundaryCount?: number; // desktop only
  mobileCompact?: boolean; // when true => [1,2,...,N-1,N]
}

export const usePagination = ({
  totalCount,
  pageSize,
  currentPage,
  siblingCount = 1,
  boundaryCount = 1,
  mobileCompact = false,
}: UsePaginationProps): (number | typeof DOTS)[] => {
  const paginationRange = useMemo<(number | typeof DOTS)[]>(() => {
    const totalPageCount = Math.ceil(totalCount / pageSize);
    if (totalPageCount <= 1) return [1];

    // ---------- MOBILE COMPACT ----------
    // Exactly: 2 from the beginning, ellipsis, 2 from the end.
    // For small page counts, just show all pages.
    if (mobileCompact) {
      if (totalPageCount <= 6) {
        return range(1, totalPageCount);
      }
      return [1, 2, DOTS, totalPageCount - 1, totalPageCount];
    }

    // ---------- DESKTOP / DEFAULT ----------
    const totalShown = 1 + siblingCount * 2 + boundaryCount * 2;
    if (totalShown >= totalPageCount) {
      return range(1, totalPageCount);
    }

    const leftSibling = Math.max(currentPage - siblingCount, 1);
    const rightSibling = Math.min(currentPage + siblingCount, totalPageCount);

    const showLeftDots = leftSibling > boundaryCount + 2;
    const showRightDots = rightSibling < totalPageCount - (boundaryCount + 1);

    const firstPages = range(1, boundaryCount);
    const lastPages = range(totalPageCount - boundaryCount + 1, totalPageCount);

    if (!showLeftDots && showRightDots) {
      const leftRange = range(1, rightSibling);
      return [...leftRange, DOTS, ...lastPages];
    }

    if (showLeftDots && !showRightDots) {
      const rightRange = range(leftSibling, totalPageCount);
      return [...firstPages, DOTS, ...rightRange];
    }

    const middleRange = range(leftSibling, rightSibling);
    return [...firstPages, DOTS, ...middleRange, DOTS, ...lastPages];
  }, [
    totalCount,
    pageSize,
    currentPage,
    siblingCount,
    boundaryCount,
    mobileCompact,
  ]);

  return paginationRange;
};
