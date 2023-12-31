'use strict';
import React, {
  useMemo,
  useEffect,
  forwardRef,
  useRef,
} from 'react';
import PropTypes from 'prop-types';
import { useTable, useResizeColumns, useFlexLayout, useSortBy, useRowSelect, useFilters, usePagination } from 'react-table';
import PaginationTableFooter from '../Pagination/pagination-table-footer';
import PaginationTableHeader from '../Pagination/pagination-table-header';

/**
 * IndeterminateCheckbox
 * @description Component for rendering the header and column checkboxs when canSelect is true
 * Taken from react-table examples
 */
const IndeterminateCheckbox = forwardRef(
  ({ indeterminate, ...rest }, ref) => {
    const defaultRef = useRef();
    const resolvedRef = ref || defaultRef;

    useEffect(() => {
      resolvedRef.current.indeterminate = indeterminate;
    }, [resolvedRef, indeterminate]);

    return (
      <input type="checkbox" ref={resolvedRef} {...rest} />
    );
  }
);

IndeterminateCheckbox.propTypes = {
  indeterminate: PropTypes.any,
  onChange: PropTypes.func
};

const Header = ({ getToggleAllRowsSelectedProps }) => (
  <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
);

Header.propTypes = {
  getToggleAllRowsSelectedProps: PropTypes.func
};

const Cell = ({ row }) => (
  <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
);

Cell.propTypes = {
  row: PropTypes.array
};

const SortableTable = ({
  sortIdx,
  rowId,
  order = 'desc',
  canSelect,
  changeSortProps,
  tableColumns = [],
  data = [],
  onSelect,
  clearSelected,
  filterIdx,
  filterPlaceholder,
  filterInputPassed
}) => {
  const defaultColumn = useMemo(
    () => ({
      // When using the useFlexLayout:
      minWidth: 30, // minWidth is only used as a limit for resizing
      width: 125, // width is used for both the flex-basis and flex-grow
      maxWidth: 300, // maxWidth is only used as a limit for resizing
    }),
    []
  );

  const {
    getTableProps,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    prepareRow,
    headerGroups,
    state: {
      selectedRowIds,
      sortBy,
      pageIndex,
      pageSize
    },
    setFilter,
    toggleAllRowsSelected
  } = useTable(
    {
      data,
      columns: tableColumns,
      defaultColumn,
      getRowId: (row, relativeIndex) => typeof rowId === 'function' ? rowId(row) : row[rowId] || relativeIndex,
      autoResetSelectedRows: false,
      autoResetSortBy: false,
      manualSortBy: false,
      pageIndex: 0,
      pageSize: 10,
      autoResetPage: false,
    },
    useFlexLayout, // this allows table to have dynamic layouts outside of standard table markup
    useResizeColumns, // this allows for resizing columns
    useFilters,
    useSortBy, // this allows for sorting
    usePagination,
    useRowSelect, // this allows for checkbox in table
    hooks => {
      if (canSelect) {
        hooks.visibleColumns.push(columns => [
          {
            id: 'selection',
            Header: Header,
            Cell: Cell,
            minWidth: 61,
            width: 61,
            maxWidth: 61
          },
          ...columns
        ]);
      }
    }
  );

  useEffect(() => {
    if (clearSelected) {
      toggleAllRowsSelected(false);
    }
  }, [clearSelected, toggleAllRowsSelected]);

  useEffect(() => {
    const selected = [];

    for (const [key, value] of Object.entries(selectedRowIds)) {
      if (value) {
        selected.push(key);
      }
    }
    if (typeof onSelect === 'function') {
      onSelect(selected);
    }
  }, [selectedRowIds, onSelect]);

  useEffect(() => {
    const [sortProps = {}] = sortBy;
    const { id, desc } = sortProps;
    let sortOrder;
    if (typeof desc !== 'undefined') {
      sortOrder = desc ? 'desc' : 'asc';
    }
    const sortFieldId = id || sortIdx;
    if (typeof changeSortProps === 'function') {
      changeSortProps({ sortIdx: sortFieldId, order: sortOrder || order });
    }
  }, [changeSortProps, sortBy, sortIdx, order]);

  useEffect(() => {
    if (filterIdx) {
      setFilter(filterIdx, filterInputPassed);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterInputPassed]);

  return (
    <div className='table--wrapper'>
      <form>
        <PaginationTableHeader
          canPreviousPage={canPreviousPage}
          canNextPage={canNextPage}
          pageOptions={pageOptions}
          pageCount={pageCount}
          gotoPage={gotoPage}
          nextPage={nextPage}
          previousPage={previousPage}
          setPageSize={setPageSize}
          pageIndex={pageIndex}
          pageSize={pageSize}
        />
        <div className='table' {...getTableProps()}>
          <div className='thead'>
            <div className='tr'>
              {headerGroups.map(headerGroup => (
                <div {...headerGroup.getHeaderGroupProps()} className="tr">
                  {headerGroup.headers.map(column => {
                    let columnClassName = '';
                    if (column.canSort) {
                      let columnClassNameSuffix;

                      if (column.isSortedDesc === true) {
                        columnClassNameSuffix = '--desc';
                      } else if (column.isSortedDesc === false) {
                        columnClassNameSuffix = '--asc';
                      } else {
                        columnClassNameSuffix = '';
                      }

                      columnClassName = `table__sort${columnClassNameSuffix}`;
                    }
                    return (
                      <div {...column.getHeaderProps()} className='th'>
                        <div {...column.getSortByToggleProps()} className={`${column.canSort ? columnClassName : ''}`}>
                          {column.render('Header')}
                        </div>
                        <div
                          {...column.getResizerProps()}
                          className={`resizer ${column.isResizing ? 'isResizing' : ''}`}
                        />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          <div className='tbody'>
            {page.map((row, i) => {
              prepareRow(row);
              return (
                <div className='tr' data-value={row.id} {...row.getRowProps()} key={i}>
                  {row.cells.map((cell, cellIndex) => {
                    const primaryIdx = canSelect ? 1 : 0;
                    return (
                      <React.Fragment key={cellIndex}>
                        <div
                          className={`td ${cellIndex === primaryIdx ? 'table__main-asset' : ''}`}
                          {...cell.getCellProps()}
                          key={cellIndex}
                        >
                          {cell.render('Cell')}
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
        <PaginationTableFooter
          canPreviousPage={canPreviousPage}
          canNextPage={canNextPage}
          pageOptions={pageOptions}
          pageCount={pageCount}
          gotoPage={gotoPage}
          nextPage={nextPage}
          previousPage={previousPage}
          pageIndex={pageIndex}
        />
      </form>
    </div>
  );
};

SortableTable.propTypes = {
  primaryIdx: PropTypes.number,
  data: PropTypes.array,
  header: PropTypes.array,
  order: PropTypes.string,
  sortIdx: PropTypes.string,
  filterIdx: PropTypes.string,
  filterPlaceholder: PropTypes.string,
  filterInputPassed: PropTypes.string,
  changeSortProps: PropTypes.func,
  onSelect: PropTypes.func,
  canSelect: PropTypes.bool,
  collapsible: PropTypes.bool,
  rowId: PropTypes.any,
  tableColumns: PropTypes.array,
  clearSelected: PropTypes.bool
};

export default SortableTable;
