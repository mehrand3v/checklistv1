// components/dashboard/ui/Pagination.jsx
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  itemsPerPage,
}) => {
  // Don't render pagination if only 1 page
  if (totalPages <= 1) return null;

  // Generate page numbers to display
  const getPageNumbers = () => {
    let pages = [];

    if (totalPages <= 5) {
      // If 5 or fewer pages, show all
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show current page and pages around it
      if (currentPage <= 3) {
        // Near the beginning
        pages = [1, 2, 3, 4, 5];
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        pages = [
          totalPages - 4,
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        ];
      } else {
        // In the middle
        pages = [
          currentPage - 2,
          currentPage - 1,
          currentPage,
          currentPage + 1,
          currentPage + 2,
        ];
      }
    }

    return pages;
  };

  return (
    <div className="flex justify-between items-center p-4 border-t border-gray-700/50">
      <div className="text-sm text-gray-400">
        Showing page {currentPage} of {totalPages} ({totalItems} total items)
      </div>
      <div className="flex space-x-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="px-2 py-1 bg-gray-800 border border-gray-700 rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="First page"
        >
          <ChevronLeft className="h-3 w-3" />
          <ChevronLeft className="h-3 w-3 -ml-1" />
        </button>
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-gray-800 border border-gray-700 rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        {/* Page numbers */}
        <div className="hidden sm:flex space-x-1">
          {getPageNumbers().map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`w-8 h-8 flex items-center justify-center rounded ${
                currentPage === pageNum
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700"
              }`}
            >
              {pageNum}
            </button>
          ))}
        </div>

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 bg-gray-800 border border-gray-700 rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4 ml-1" />
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="px-2 py-1 bg-gray-800 border border-gray-700 rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Last page"
        >
          <ChevronRight className="h-3 w-3" />
          <ChevronRight className="h-3 w-3 -ml-1" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
