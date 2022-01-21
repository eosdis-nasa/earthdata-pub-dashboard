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
      <li className="page-item" onClick={() => previousPage()} disabled={!canPreviousPage}>
        <a className="page-link">{'<'} Previous</a>
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
            <a data-value={pageNumber} onClick={() => gotoPage(page)} className="page-item">
              {pageNumber}
            </a>
          </li>
        );
      })}
      <li className="page-item" onClick={() => nextPage()} disabled={!canNextPage}>
        <a className="page-link">Next {'>'}</a>
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
