'use strict';
import React from 'react';
import c from 'classnames';
import PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';
import { logout, getApiVersion, getEarthdatapubInstanceMetadata } from '../../actions';
import { graphicsPath, nav, overviewUrl } from '../../config';
import { strings } from '../locale';
import { kibanaAllLogsLink } from '../../utils/kibana';
import mainLogo from '../../../assets/images/nasa-logo.svg';

const paths = [
  ['Requests', '/requests'],
  ['Workflows', '/workflows'],
  ['Metrics', '/metrics'],
  ['Users', '/users'],
  ['Groups', '/groups'],
  ['Roles', '/roles'],
];

class Header extends React.Component {
  constructor () {
    super();
    this.displayName = 'Header';
    this.logout = this.logout.bind(this);
    this.className = this.className.bind(this);
    this.linkTo = this.linkTo.bind(this);
  }

  componentDidMount () {
    const { dispatch } = this.props;
    dispatch(getApiVersion());
    // dispatch(getEarthdatapubInstanceMetadata());
  }

  logout () {
    const { dispatch, history } = this.props;
    dispatch(logout());
    localStorage.removeItem('auth-token');
    window.location.href = overviewUrl;
    history.push('/');
  }

  className (path) {
    const active = this.props.location.pathname.slice(0, path.length) === path; // nav issue with router
    const menuItem = path.replace('/', '');
    const order = 'nav__order-' + (nav.order.indexOf(menuItem) === -1 ? 2 : nav.order.indexOf(menuItem));
    return c({
      active: active,
      [order]: true
    });
  }

  linkTo (path) {
    if (path[0] === 'Logs') {
      const kibanaLink = kibanaAllLogsLink(this.props.earthdatapubInstance);
      return <a href={kibanaLink} target="_blank">{path[0]}</a>;
    } else {
      return <Link to={{ pathname: path[1], search: this.props.location.search }}>{path[0]}</Link>;
    }
  }

  render () {
    const { authenticated } = this.props.api;
    const activePaths = paths.filter(path => nav.exclude[path[0]] !== true);
    const feedbackUrl = overviewUrl + '/feedback';
    console.log(feedbackUrl);
    return (
      <div className='header' role="navigation" aria-label="Header">
        <div className='row'>
          <h1 className='logo' aria-label="Earthdata pub logo"><Link to={{ pathname: '/', search: this.props.location.search }}><img alt="Logo" src={mainLogo} /><div>EDPub</div></Link></h1>
          <nav>
            { !this.props.minimal ? <ul>
              {activePaths.map(path => <li
                key={path[0]}
                className={this.className(path[1])}>{this.linkTo(path)}</li>)}
              <div className='rightalign nav__order-8'>
                <ul className='right-ul'>
                  <li className='overviewLink'>{ overviewUrl ? <a href={overviewUrl}>Overview</a> : '' }</li>
                  <li className='overviewLink'>{ overviewUrl ? <a href={feedbackUrl}>Feedback</a> : '' }</li>
                  <li className='logOut'>{ authenticated ? <a onClick={this.logout}><span className="log-icon"></span>Log out</a> : <Link to={'/login'}>Log in</Link> }</li></ul></div>
            </ul> : <li>&nbsp;</li> }
          </nav>
        </div>
      </div>
    );
  }
}

Header.propTypes = {
  api: PropTypes.object,
  dispatch: PropTypes.func,
  location: PropTypes.object,
  history: PropTypes.object,
  minimal: PropTypes.bool,
  earthdatapubInstance: PropTypes.object
};

export default withRouter(Header);
