import React, { useEffect, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import LoadingOverlay from '../LoadingIndicator/loading-overlay';
import { updateSearchModal } from '../../actions';
import config from './config';

const listSize = 10;

const SearchModal = ({ dispatch, search, entity, submit, cancel, filters = {} }) => {
  const { title, path, primary, fields } = config[entity];
  const [selected, setSelected] = useState(false);
  const [searchParams, setSearchParams] = useState({});
  const [page, setPage] = useState(1);
  useEffect(() => {
    setPage(1);
    dispatch(updateSearchModal(path, {
      ...Object.entries(searchParams).reduce((acc, [key, value]) => {
        if (value && value !== '') {
          acc[key] = value;
        }
        return acc;
      }, {})
    }));
  }, [searchParams]);

  function paginate (arr, page_size, page_number) {
    return arr.slice((page_number - 1) * page_size, page_number * page_size);
  }

  const { list, inflight } = search;
  const entityArr = paginate(list, listSize, page);
  let filteredArr;
  if (typeof filters !== 'undefined') {
    filteredArr = filters.length > 0 ? entityArr.filter((elem) => entity === 'group' ? filters.includes(elem.short_name) : !filters.includes(elem.short_name)) : entityArr;
  }
  return (
    <div className='search-modal__background'
      onClick={() => { cancel(); }}>
      { inflight && <LoadingOverlay /> }
      <div className='search-modal'
        onClick={(e) => e.stopPropagation()}>
        <div className='search-modal__title'>
          <h2 className=' heading--large'>{title}</h2>
        </div>
        <div className='search-modal__body'>
          <ul className='search-modal__list'>
            <li className='search-modal__list-header'>
              { fields.map(({ heading, field, searchable, sortable }, key) => (<div key={key}>
                <div className='search-modal__list-header-text'>{heading}</div>
                <input type='text'
                  placeholder='Search...'
                  onChange={(e) => setSearchParams({
                    ...searchParams,
                    [field]: e.target.value
                  })}></input>
              </div>))}
            </li>
            { Array.isArray(filteredArr)
              ? filteredArr.map((item, key) => {
                const className = `search-modal__item${item[primary] === selected
                ? '--selected'
: ''}`;
                return (<li className={className}
                onClick={() => setSelected(item[primary])}
                key={key}>
                { fields.map(({ field }, key) => (<div key={key}>{item[field]}</div>))}
              </li>
                );
              })
              : null}
            { typeof filteredArr !== 'undefined' && filteredArr.length < listSize &&
            Array(listSize - filteredArr.length).fill(0).map((i, key) => (
              <li key={key} className='search-modal__item--hidden'></li>))
            }
          </ul>
        </div>
        <ul className="pagination" style={{ display: 'flex' }}>
          {
            inflight || page - 1 === 0
              ? <li className="page-item button--disabled">
              <button type="button" className="page-link" aria-label="Previous page" disabled>{'<'} Previous</button>
            </li>
              : <li className="page-item">
              <button type="button" className="page-link" aria-label="Previous page" onClick={() => setPage(page - 1)}>{'<'} Previous</button>
            </li>
          }
          <li className="page-item">
            <button type="button" className="page-link" aria-label={`Page ${page}`} aria-current="page">{page}</button>
          </li>
          {
            inflight || (page * listSize) >= list.length
              ? <li className="page-item button--disabled">
              <button type="button" className="page-link" aria-label="Next page" disabled>Next {'>'}</button>
            </li>
              : <li className="page-item">
              <button type="button" className="page-link" aria-label="Next page" onClick={() => setPage(page + 1)}>Next {'>'}</button>
            </li>
          }
        </ul>
        <div className='search-modal__controls'>
          <button className='button button--cancel button__animation--md button__arrow button__arrow--md button__animation button--secondary'
            onClick={() => { cancel(); }}
            disabled={inflight}>
            Cancel
          </button>
          <button className={'button button--submit button__animation--md button__arrow button__arrow--md button__animation button__arrow--white' + (!selected || inflight ? ' button--disabled' : '')}
            onClick={() => { submit(selected); }}
            disabled={!selected || inflight}>
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default connect(state => ({
  search: state.searchModal
}))(SearchModal);
