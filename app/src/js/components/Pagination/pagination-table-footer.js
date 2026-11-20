import React from 'react';
import PropTypes from 'prop-types';

const VISIBLE_PAGES = 7;

const PaginationTableFooter = ({
  canPreviousPage,
  canNextPage,
  pageOptions,
  pageCount,
  gotoPage,
  nextPage,
  previousPage,
  pageIndex,
}) => {
  const currentPage = pageIndex + 1;

  return (
    <ul className="pagination">
      <li className="page-item">
        <button type="button" className="page-link" aria-label="Previous page" onClick={() => previousPage()} disabled={!canPreviousPage}>{'<'} Previous</button>
      </li>
      {pageOptions.map((page) => {
        const firstPage = 1;
        const pageNumber = page + 1;
        const isNotFirstPage = pageNumber !== firstPage;
        const isNotLastPage = pageNumber !== pageCount;
        const isHiddenPage =
            pageNumber < currentPage - (VISIBLE_PAGES - 1) / 2 || pageNumber > currentPage + (VISIBLE_PAGES - 1) / 2;
        const shouldHaveEllipses =
              isHiddenPage &&
              (pageNumber === firstPage + 1 || pageNumber === pageCount - 1);

        if (isNotFirstPage && isNotLastPage && isHiddenPage) {
          if (shouldHaveEllipses) {
            return <li key={page}>...</li>;
          }
          return;
        }

        return (
          <li
            key={page}
            className={page === pageIndex ? 'pagination__link--active' : ''}
          >
            <button type="button" data-value={pageNumber} onClick={() => gotoPage(page)} className="page-item" aria-label={`Page ${pageNumber}`} aria-current={page === pageIndex ? 'page' : undefined}>
              {pageNumber}
            </button>
          </li>
        );
      })}
      <li className="page-item">
        <button type="button" className="page-link" aria-label="Next page" onClick={() => nextPage()} disabled={!canNextPage}>Next {'>'}</button>
      </li>
    </ul>
  );
};

PaginationTableFooter.propTypes = {
  canPreviousPage: PropTypes.bool,
  canNextPage: PropTypes.bool,
  pageOptions: PropTypes.array,
  pageCount: PropTypes.number,
  gotoPage: PropTypes.func,
  nextPage: PropTypes.func,
  previousPage: PropTypes.func,
  setPageSize: PropTypes.func,
  pageIndex: PropTypes.number,
  pageSize: PropTypes.number
};

export default PaginationTableFooter;
