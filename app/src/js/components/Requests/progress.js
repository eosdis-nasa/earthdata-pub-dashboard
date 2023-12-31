'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'object-path';
import { tally } from '../../utils/format';
import { strings } from '../locale';

// defines the order in which the requests meta bar appears
const requestMeta = [
  ['running', 'Running'],
  ['completed', 'Completed'],
  ['failed', 'Failed']
];
class Progress extends React.Component {
  constructor () {
    super();
    this.getItem = this.getItem.bind(this);
    this.tallyDisplay = this.tallyDisplay.bind(this);
  }

  getItem (key) {
    return this.props.requests.find(count => count.key === key);
  }

  tallyDisplay (type, item) {
    if (type[1] === 'Failed' && item > 0) {
      return (
        <span className='num--medium num--medium--red'>{item}</span>
      );
    } else {
      return (
        <span className='num--medium'>{item}</span>
      );
    }
  }

  render () {
    return (
      <ul className='timeline--processing--overall'>
        {requestMeta.map(d => {
          const item = Array.isArray(d[0])
            ? d[0].map(this.getItem).reduce((a, b) => {
              return a + get(b, 'count', 0);
            }, 0)
            : get(this.getItem(d[0]), 'count', 0);
          return (
            <li key={d[0]} className={'timeline--processing--' + d[0]}>
              {this.tallyDisplay(d, tally(item))}
              {strings.requests} {d[1]}
            </li>
          );
        })}
      </ul>
    );
  }
}

Progress.propTypes = { requests: PropTypes.array };

export default Progress;
