'use strict';
import React from 'react';
import Paginator from 'paginator';
import PropTypes from 'prop-types';

const disabled = ' pagination__link--disabled';

function PageButton ({ page, label, className, current, onClick }) {
  return (
    <button
      type="button"
      className={className}
      aria-label={label}
      aria-current={current ? 'page' : undefined}
      disabled={!onClick}
      onClick={onClick}
    >
      {page}
    </button>
  );
}

PageButton.propTypes = {
  page: PropTypes.node,
  label: PropTypes.string,
  className: PropTypes.string,
  current: PropTypes.bool,
  onClick: PropTypes.func
};

class Pagination extends React.Component {
  constructor () {
    super();
    this.displayName = 'Pagination';
    this.setPage = this.setPage.bind(this);
  }

  setPage (newPage) {
    const { page, limit, count } = this.props;
    if (+page !== newPage && newPage >= 1 && newPage <= Math.ceil(count / limit)) {
      this.props.onNewPage(newPage);
    }
  }

  render () {
    const { page, limit, count } = this.props;
    if (!isNaN(count) && !isNaN(limit) && !isNaN(page)) {
      const currentPage = +page;
      const paginator = new Paginator(limit, 7);
      const meta = paginator.build(count, currentPage);
      const pages = [];
      for (let i = meta.first_page; i <= meta.last_page; ++i) { pages.push(i); }
      const jumpToFirst = meta.first_page > 1 && (
        <li>
          <PageButton page="1" label="Page 1" onClick={() => this.setPage(1)} />
          <span aria-hidden="true"> ... </span>
        </li>
      );
      const jumpToLast = meta.last_page < meta.total_pages && (
        <li>
          <span aria-hidden="true"> ... </span>
          <PageButton page={meta.total_pages} label={`Page ${meta.total_pages}`} onClick={() => this.setPage(meta.total_pages)} />
        </li>
      );

      return (
        <nav className='pagination' aria-label="Pagination">
          <ol>
            <li>
              <PageButton
                page="Previous"
                label="Previous page"
                className={'previous' + (meta.has_previous_page ? '' : disabled)}
                onClick={meta.has_previous_page ? () => this.setPage(meta.previous_page) : null}
              />
            </li>
            {jumpToFirst}
            {pages.map(d => (
              <li key={d} className={d === currentPage ? 'pagination__link--active' : ''}>
                <PageButton
                  page={d}
                  label={`Page ${d}`}
                  current={d === currentPage}
                  onClick={() => this.setPage(d)}
                />
              </li>
            ))}
            {jumpToLast}
            <li>
              <PageButton
                page="Next"
                label="Next page"
                className={'next' + (meta.has_next_page ? '' : disabled)}
                onClick={meta.has_next_page ? () => this.setPage(meta.next_page) : null}
              />
            </li>
          </ol>
        </nav>
      );
    } else return <div></div>;
  }
}

Pagination.propTypes = {
  page: PropTypes.number,
  limit: PropTypes.number,
  count: PropTypes.number,
  onNewPage: PropTypes.func
};

export default Pagination;
