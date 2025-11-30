// import { ChevronLeft, ChevronRight } from "lucide-react";
// import React from "react";
// import { DOTS, usePagination } from "./usePagination";

// interface PaginationProps {
//   onPageChange: (pageNumber: number) => void;
//   totalCount: number;
//   siblingCount?: number;
//   currentPage: number;
//   pageSize: number;
// }

// const Pagination: React.FC<PaginationProps> = (props) => {
//   const {
//     onPageChange,
//     totalCount,
//     siblingCount = 1,
//     currentPage,
//     pageSize,
//   } = props;

//   const paginationRange = usePagination({
//     currentPage,
//     totalCount,
//     siblingCount,
//     pageSize,
//   });

//   const onNext = () => {
//     onPageChange(currentPage + 1);
//   };

//   const onPrevious = () => {
//     onPageChange(currentPage - 1);
//   };

//   const isFirstPage = currentPage === 1;
//   const isLastPage =
//     paginationRange[paginationRange.length - 1] === currentPage;

//   return (
//     <div className="flex items-center mt-5">
//       <button
//         // className={isFirstPage ? "" : ""}
//         className="text-black px-4"
//         onClick={onPrevious}
//         disabled={isFirstPage}
//       >
//         <ChevronLeft className="h-4 w-4" />
//       </button>
//       {paginationRange.map((pageNumber: any) => {
//         if (pageNumber === DOTS) {
//           return (
//             <span key={pageNumber as string} className="px-3 py-1">
//               ...
//             </span>
//           );
//         }

//         return (
//           <button
//             key={pageNumber as number}
//             className={` ${
//               pageNumber === currentPage
//                 ? "bg-[#00328B] text-white"
//                 : "bg-secondary text-black"
//             } rounded-lg text-base px-4 py-2 me-3 font-bold `}
//             onClick={() => onPageChange(pageNumber as number)}
//           >
//             {pageNumber}
//           </button>
//         );
//       })}
//       <button
//         // className={isLastPage ? "" : ""}
//         className="text-black px-4"
//         onClick={onNext}
//         disabled={isLastPage}
//       >
//         <ChevronRight className="h-4 w-4" />
//       </button>
//     </div>
//   );
// };

// export default Pagination;

import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";
import { DOTS, usePagination } from "./usePagination";

interface PaginationProps {
  onPageChange: (pageNumber: number) => void;
  totalCount: number;
  siblingCount?: number;
  currentPage: number;
  pageSize: number;
  forceCompact?: boolean; // optional override
  boundaryCount?: number; // desktop only
}

// tiny media-query hook
function useMediaQuery(query: string) {
  const [matches, setMatches] = React.useState(false);
  React.useEffect(() => {
    const m = window.matchMedia(query);
    const onChange = () => setMatches(m.matches);
    onChange();
    m.addEventListener("change", onChange);
    return () => m.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

const Pagination: React.FC<PaginationProps> = ({
  onPageChange,
  totalCount,
  siblingCount = 1,
  currentPage,
  pageSize,
  forceCompact,
  boundaryCount = 1,
}) => {
  const isPhone = useMediaQuery("(max-width: 480px)");
  const mobileCompact = forceCompact ?? isPhone;

  const paginationRange = usePagination({
    currentPage,
    totalCount,
    siblingCount,
    pageSize,
    boundaryCount,
    mobileCompact, // <-- key line
  });

  const totalPageCount = Math.ceil(totalCount / pageSize);

  const onNext = () =>
    currentPage < totalPageCount && onPageChange(currentPage + 1);
  const onPrevious = () => currentPage > 1 && onPageChange(currentPage - 1);

  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPageCount;

  if (!paginationRange || paginationRange.length < 1) return null;

  return (
    <nav
      className="flex items-center flex-wrap gap-2 mt-5"
      aria-label="Pagination"
    >
      <button
        className="px-3 py-2 rounded-lg border text-black disabled:opacity-40 disabled:cursor-not-allowed"
        onClick={onPrevious}
        disabled={isFirstPage}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {paginationRange.map((item, idx) => {
        if (item === DOTS) {
          return (
            <span
              key={`dots-${idx}`}
              className="px-2 text-gray-500 select-none"
              aria-hidden="true"
            >
              …
            </span>
          );
        }

        const pageNumber = item as number;
        const isActive = pageNumber === currentPage;

        return (
          <button
            key={`page-${pageNumber}`}
            className={`rounded-lg text-sm px-3 py-2 font-semibold transition-colors ${
              isActive
                ? "bg-[#00328B] text-white"
                : "bg-secondary text-black hover:bg-secondary/80"
            }`}
            onClick={() => onPageChange(pageNumber)}
            aria-current={isActive ? "page" : undefined}
            aria-label={`Page ${pageNumber}`}
          >
            {pageNumber}
          </button>
        );
      })}

      <button
        className="px-3 py-2 rounded-lg border text-black disabled:opacity-40 disabled:cursor-not-allowed"
        onClick={onNext}
        disabled={isLastPage}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
};

export default Pagination;
