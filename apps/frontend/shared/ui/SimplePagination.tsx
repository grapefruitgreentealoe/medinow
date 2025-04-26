'use client';

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from '@/components/ui/pagination';

interface SimplePaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function SimplePagination({
  page,
  totalPages,
  onPageChange,
}: SimplePaginationProps) {
  return (
    <>
      <Pagination>
        <PaginationContent>
          {page > 1 && (
            <PaginationItem>
              <PaginationPrevious
                className={page <= 1 ? 'pointer-events-none hidden' : ''}
                onClick={() => onPageChange(page - 1)}
              />
            </PaginationItem>
          )}

          {page < totalPages && (
            <PaginationItem>
              <PaginationNext
                className={
                  page >= totalPages ? 'pointer-events-none hidden' : ''
                }
                onClick={() => onPageChange(page + 1)}
              />
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
      {page >= totalPages && (
        <div className="w-full text-center !mb-4">
          <div className="inline-block !px-4 !py-2 rounded-md bg-secondary text-muted-foreground text-sm shadow-sm">
            마지막 페이지입니다
          </div>
        </div>
      )}
    </>
  );
}
