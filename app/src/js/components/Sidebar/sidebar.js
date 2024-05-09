'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { resolve } from 'path';
import sections from '../../paths';
import chevronRight from '../../../assets/images/layout/chevron-right.svg';
import chevronLeft from '../../../assets/images/layout/chevron-left.svg';

const currentPathClass = 'sidebar__nav--selected';

class Sidebar extends React.Component {
  constructor (props) {
    super(props);
    this.state = {};
    this.displayName = 'Sidebar';
    this.resolvePath = this.resolvePath.bind(this);
    this.renderNavSection = this.renderNavSection.bind(this);
  }

  resolvePath (base, path) {
    return path ? resolve(base, path) : resolve(base);
  }

  renderNavSection (section) {
    const { base, routes } = section;
    const { count } = this.props;
    const currentPath = this.props.currentPath || this.props.location.pathname;
    const params = {
      ...(this.props.params || {}),
      ...(this.props.match ? this.props.match.params : {})
    };
    let cnt = 0;
    routes(currentPath, params, count).map((d, i) => {
      if (parseInt(i) > 0) {
        cnt = parseInt(i);
      }
    });
    if (parseInt(cnt) > 0) {
      return (
      <div key={base}>
        <ul>
          {
            routes(currentPath, params, count).map((d, i) => {
              const path = this.resolvePath(base, d[1]);
              const classes = [
                // d[2] might be a function; use it only when it's a string
                typeof d[2] === 'string' ? d[2] : '',
                path === currentPath ? currentPathClass : ''
              ].join(' ');
              const title = base + ' link';
              return (
                <li key={base + i}>
                    <Link className={classes} to={path} title={title} aria-label={d[0]}>
                        {d[0]}
                    </Link>
                </li>
              );
            }
            )
          }
        </ul>
      </div>
      );
    } else { return null; }
  }

  openNav () {
    const el = document.querySelectorAll('div.sidebar');
    for (const i in el) {
      if (typeof el[i].classList !== 'undefined') {
        if (el[i].classList.contains('hidden')) {
          el[i].classList.remove('hidden');
        }
      }
    }
    document.getElementById('openButton').style.display = 'none';
  }

  closeNav () {
    const el = document.querySelectorAll('div.sidebar');
    for (const i in el) {
      if (typeof el[i].classList !== 'undefined') {
        if (!el[i].classList.contains('hidden')) {
          el[i].classList.add('hidden');
        }
      }
    }
    document.getElementById('openButton').style.display = 'unset';
  }

  render () {
    // Don't display sidebar if no items to present
    if (Object.values(this.state).every(item => item === null)) {
      return null;
    } else {
      // If items exist and if user is on mobile device
      const mobile = localStorage.getItem('mobile');
      return (
            <><button className={mobile === 'true' || document.querySelectorAll('div.sidebar.hidden').length > 0 ? 'openbtn' : 'openbtn hidden'} onClick={this.openNav} id="openButton"><img width="30px" src={chevronRight} /></button>
            <div className={mobile === 'true' ? 'sidebar hidden' : 'sidebar'}>
                <a href="#" onClick={this.closeNav} className='closebtn' id="closeButton"><img width="30px" src={chevronLeft} style={{ marginTop: '10px' }}/></a>
                <div className='sidebar__row'>
                  {sections.map(this.renderNavSection)}
                </div>
            </div></>
      );
    }
  }

  async componentDidMount () {
    await this.setState(sections.map(this.renderNavSection));
  }
}

Sidebar.propTypes = {
  currentPath: PropTypes.string,
  params: PropTypes.object,
  count: PropTypes.array,
  location: PropTypes.object,
  match: PropTypes.object
};

export default Sidebar;
