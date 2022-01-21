import React, { useEffect, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import LoadingOverlay from '../LoadingIndicator/loading-overlay';
import { updateSearchModal } from '../../actions';
import config from './config';

const listSize = 10;

const SearchModal = ({ dispatch, search, entity, submit, cancel }) => {
  const { title, path, primary, fields } = config[entity];
  const [selected, setSelected] = useState(false);
  const [searchParams, setSearchParams] = useState({ page: 0, per_page: listSize });
  useEffect(() => {
    dispatch(updateSearchModal(path, {
      ...Object.entries(searchParams).reduce((acc, [key, value]) => {
        if (value && value !== '') {
          acc[key] = value;
        }
        return acc;
      }, {})
    }));
  }, [searchParams]);
  const { list, inflight } = search;
  return (
    <div className='search-modal__background'
      onClick={() => { cancel(); }}>
      { inflight && <LoadingOverlay /> }
      <div className='search-modal'
        onClick={(e) => e.stopPropagation()}>
        <div className='search-modal__title'>
          <h1 className=' heading--large'>{title}</h1>
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
                    page: 0,
                    [field]: e.target.value
                  })}></input>
              </div>))}
            </li>

            { list.map((item, key) => {
              const className = `search-modal__item${item[primary] === selected
                ? '--selected' : ''}`;
              return (<li className={className}
                onClick={() => setSelected(item[primary])}
                key={key}>
                { fields.map(({ field }, key) => (<div key={key}>{item[field]}</div>))}
              </li>
              );
            })}
            { list.length < listSize &&
            Array(listSize - list.length).fill(0).map((i, key) => (
              <li key={key} className='search-modal__item--hidden'></li>))
            }
          </ul>
        </div>
        <div className='search-modal__controls'>
          <button className='button button--medium button--previous'
            onClick={() => setSearchParams({ ...searchParams, page: Math.max(0, searchParams.page - 1) })}
            disabled={searchParams.page <= 0 || inflight}>
            Previous Page
          </button>
          <button className='button button--medium button--next'
            onClick={() => setSearchParams({ ...searchParams, page: Math.max(0, searchParams.page + 1) })}
            disabled={list.length < listSize || inflight}>
            Next Page
          </button>
          <button className='button button--medium button--cancel'
            onClick={() => { cancel(); }}
            disabled={inflight}>
            Cancel
          </button>
          <button className='button button--medium button--check'
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
