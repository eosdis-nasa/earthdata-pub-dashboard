import React from 'react';
import PropTypes from 'prop-types';

function ArrayFieldTemplate ({ items, canAdd, onAddClick }) {
  return (
    <div>
      <div className={'model-builder-array'}>
        {items &&
        items.map(element => (
          <div key={element.key} className={'array-item'}>
            <div>{element.children}</div>
            <div className="row">
              {element.hasMoveDown && (
                <button
                  className='button button--small'
                  onClick={element.onReorderClick(element.index, element.index + 1)}>Down</button>
              )}
              {element.hasMoveUp && (
                <button
                  className='button button--small'
                  onClick={element.onReorderClick(element.index, element.index - 1)}>Up</button>
              )}
              <button
                className='button button--remove button__animation--md button__arrow button__arrow--md button__animation'
                onClick={element.onDropIndexClick(element.index)}>Remove</button>
            </div>
          </div>
        ))}
      </div>
      {canAdd && (
        <button
          className="button button--add button__animation--md button__arrow button__arrow--md button__animation button__arrow--white"
          onClick={onAddClick} type="button">Add Row</button>
      )}
    </div>
  );
}

ArrayFieldTemplate.propTypes = {
  items: PropTypes.array,
  canAdd: PropTypes.bool,
  onAddClick: PropTypes.func
};

export default ArrayFieldTemplate;
