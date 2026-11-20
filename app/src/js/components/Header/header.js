'use strict';
import React from 'react';
import c from 'classnames';
import PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { getApiVersion } from '../../actions';
import { nav, overviewUrl, helpPageDefault} from '../../config';
import { isAdminUser } from '../../utils/privileges';
import mainLogo from '../../../assets/images/nasa-logo.svg';
import _config from '../../config/config';

const paths = [
  ['Requests', '/requests', 'REQUEST'],
  ['Workflows', '/workflows', 'WORKFLOW'],
  ['Metrics', '/metrics', 'METRICS'],
  ['Users', '/users', 'USER'],
  ['Groups', '/groups', 'GROUP'],
  ['Roles', '/roles', 'ROLE'],
  ['Conversations', '/conversations', 'CONVERSATION']
];

const { logoutUrl, cognitoClientLogoutUrl } = _config;
const post_logout_redirect_uri = encodeURIComponent(cognitoClientLogoutUrl);
const logoutUrlWithRedirect = `${logoutUrl}${post_logout_redirect_uri ? `&post_logout_redirect_uri=${post_logout_redirect_uri}` : ''}`;

class Header extends React.Component {
  constructor () {
    super();
    this.displayName = 'Header';
    this.className = this.className.bind(this);
    this.linkTo = this.linkTo.bind(this);
  }

  componentDidMount () {
    const { dispatch } = this.props;
    dispatch(getApiVersion());
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
    return <Link to={{
      pathname: path[1],
      search: this.props.location.search.split('?')[0]
    }} aria-label={path[0]}>{path[0]}</Link>;
  }

  logoutControl () {
    const label = <><span className="log-icon"></span>Log out</>;
    let localPath = '';
    try {
      const parsed = new URL(logoutUrlWithRedirect, window.location.origin);
      if (parsed.origin === window.location.origin && parsed.pathname.endsWith('/logout') && !parsed.search) localPath = '/logout';
    } catch (e) {
      localPath = '';
    }
    if (localPath) return <Link to={localPath}>{label}</Link>;
    return <a href={logoutUrlWithRedirect}>{label}</a>;
  }

  render () {
    const { authenticated } = this.props.api;
    const { privileges, user, userId, isAdmin } = this.props;
    const activePaths = paths.filter(path => {
      return (!!privileges[path[2]] || privileges.ADMIN) || path[2].match(/CONVERSATION/g) || path[2].match(/METRICS/g);
    });
    const show508 = authenticated && isAdmin;

    return (
      <div className='header'>
        <div className='row'>
          <div className='logo'><Link to={{ pathname: '/', search: this.props.location.search }}><img alt="" src={mainLogo} /><div>EDPub</div></Link></div>
          <nav>
            { !this.props.minimal
              ? <><ul className="default_header">
                            { authenticated && activePaths.map(path => <li
                                key={path[0]}
                                className={this.className(path[1])}>{this.linkTo(path)}</li>)}
                            <li className='rightalign nav__order-8'>
                                <ul className='right-ul'>
                                    {show508 &&
                                    <li className={this.props.location.pathname.indexOf('/508-report') === 0 ? 'nav-508 active' : 'nav-508'}><Link to="/508-report">508 compliance</Link></li>}
                                    <li className='overviewLink'>{overviewUrl ? <a href={overviewUrl}>Overview</a> : ''}</li>
                                    {authenticated &&
                                        <li><Link to={`/users/id/${userId}`}>Hi, {user}</Link></li>}
                                    <li className='howToUseLink'>{helpPageDefault ? <a href={'/getting_started'}>Help</a> : ''}</li>
                                    <li className='logOut'>{authenticated ? this.logoutControl() : <Link to={'/login'}>Log in</Link>}</li></ul>
                            </li>
                        </ul><div id="menuToggle">
                                <input type="checkbox" aria-label="Open the menu" />

                                <span></span>
                                <span></span>
                                <span></span>

                                <ul id="menu">
                                {activePaths.map(path => <li
                                key={path[0]}
                                className={this.className(path[1])}>{this.linkTo(path)}</li>)}
                                    {show508 &&
                                    <li className={this.props.location.pathname.indexOf('/508-report') === 0 ? 'nav-508 active' : 'nav-508'}><Link to="/508-report">508 compliance</Link></li>}
                                    <li className='overviewLink'>{overviewUrl ? <a href={overviewUrl}>Overview</a> : ''}</li>
                                    {authenticated &&
                                        <li><Link to={`/users/id/${userId}`}>Hi, {user}</Link></li>}
                                    <li className='howToUseLink'>{helpPageDefault ? <a href={'/getting_started'}>Help</a> : ''}</li>
                                    <li className='logOut'>{authenticated ? this.logoutControl() : <Link to={'/login'}>Log in</Link>}</li>
                                </ul>
                            </div></>
              : null }
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
  privileges: PropTypes.object,
  user: PropTypes.string,
  userId: PropTypes.string,
  isAdmin: PropTypes.bool,
  earthdatapubInstance: PropTypes.object
};

export default withRouter(connect(state => ({
  privileges: state.api.tokens.privileges,
  user: state.api.tokens.userName,
  userId: state.api.tokens.userId,
  isAdmin: isAdminUser(state.api.tokens)
}))(Header));
