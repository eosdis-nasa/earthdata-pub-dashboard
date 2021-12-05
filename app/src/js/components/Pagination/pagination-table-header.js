import React from 'react';
import PropTypes from 'prop-types';

const PaginationTableHeader = ({
  canPreviousPage,
  canNextPage,
  pageOptions,
  pageCount,
  gotoPage,
  nextPage,
  previousPage,
  setPageSize,
  pageIndex,
  pageSize
}) => {
  return (
    <ul className="pagination" style={{ display: 'flex' }}>
      <li className="total-records" style={{ textAlign: 'left', flex: 1 }}>Page {pageIndex + 1} of {pageOptions.length}</li>
      <div style={{ textAlign: 'center', flex: 1 }}>
        <li className="page-item" onClick={() => previousPage()} disabled={!canPreviousPage}>
          <a className="page-link">{'<'} Previous</a>
        </li>
        <select
          className="page-dropdown"
          value={pageIndex + 1}
          onChange={e => {
            const page = e.target.value ? Number(e.target.value) - 1 : 0;
            gotoPage(page);
          }}>
          {[...Array(pageCount).keys()].map(pageNumber => (
            <option key={pageNumber + 1} value={pageNumber + 1}>
              {pageNumber + 1}
            </option>
          ))}
        </select>
        <li className="page-item" onClick={() => nextPage()} disabled={!canNextPage}>
          <a className="page-link">Next {'>'}</a>
        </li>
      </div>
      <li className="page-navigation" style={{ textAlign: 'right', flex: 1 }}>
          Show <select
          className="form-control"
          value={pageSize}
          onChange={e => {
            setPageSize(Number(e.target.value));
          }}
        >
          {[5, 10, 20, 30, 40, 50].map(pageSize => (
            <option key={pageSize} value={pageSize}>
              {pageSize}
            </option>
          ))}
        </select> per page
      </li>
    </ul>
  );
};

PaginationTableHeader.propTypes = {
  canPreviousPage: PropTypes.bool,
  canNextPage: PropTypes.bool,
  pageOptions: PropTypes.object,
  pageCount: PropTypes.number,
  gotoPage: PropTypes.func,
  nextPage: PropTypes.func,
  previousPage: PropTypes.func,
  setPageSize: PropTypes.func,
  pageIndex: PropTypes.number,
  pageSize: PropTypes.number
};

export default PaginationTableHeader;
