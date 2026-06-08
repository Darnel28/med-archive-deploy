import React from 'react';

export const DEFAULT_PAGE_SIZE = 15;

export function paginateRows(rows, page, pageSize = DEFAULT_PAGE_SIZE) {
  const list = Array.isArray(rows) ? rows : [];
  const totalPages = Math.max(1, Math.ceil(list.length / pageSize));
  const safePage = Math.min(Math.max(Number(page) || 1, 1), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    page: safePage,
    totalPages,
    rows: list.slice(start, start + pageSize),
    start,
    end: Math.min(start + pageSize, list.length),
  };
}

export default function Pagination({ page, totalItems, pageSize = DEFAULT_PAGE_SIZE, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil((Number(totalItems) || 0) / pageSize));
  const currentPage = Math.min(Math.max(Number(page) || 1, 1), totalPages);

  if (totalItems <= pageSize) return null;

  return (
    <div className="table-pagination">
      <button className="table-page" type="button" disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>
        Precedent
      </button>
      <span className="table-page active">{currentPage}</span>
      <button className="table-page" type="button" disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)}>
        Suivant
      </button>
    </div>
  );
}
