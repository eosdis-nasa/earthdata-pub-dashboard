'use strict';
import React from 'react';
import c from 'classnames';
import PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { logout, getApiVersion } from '../../actions';
import { nav, overviewUrl, helpPageDefault} from '../../config';
import mainLogo from '../../../assets/images/nasa-logo.svg';

const paths = [
  ['Requests', '/requests', 'REQUEST'],
  ['Workflows', '/workflows', 'WORKFLOW'],
  ['Metrics', '/metrics', 'METRICS'],
  ['Users', '/users', 'USER'],
  ['Groups', '/groups', 'GROUP'],
  ['Roles', '/roles', 'ROLE'],
  ['Conversations', '/conversations', 'CONVERSATION'],
  ['Inputs', '/inputs', 'INPUTS'],
  ['Forms', '/forms', 'FORMS']
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
  }

  logout () {
    const { dispatch, history } = this.props;
    dispatch(logout());
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
    return <Link to={{
      pathname: path[1],
      search: this.props.location.search.split('?')[0]
    }} aria-label={path[0]}>{path[0]}</Link>;
  }

  render () {
    const { authenticated } = this.props.api;
    const { privileges, user, userId } = this.props;
    const activePaths = paths.filter(path => {
      if (path[2] === 'FORMS') {
        return privileges.ADMIN;
      }
      if (path[2] === 'INPUTS') {
        return privileges.ADMIN;
      }
      return (!!privileges[path[2]] || privileges.ADMIN) || path[2].match(/CONVERSATION/g);
    });
    
    return (
      <div className='header' aria-label="Header">
        <div className='row'>
          <h1 className='logo' aria-label="Earthdata pub logo"><Link to={{ pathname: '/', search: this.props.location.search }}><img alt="Logo" src={mainLogo} /><div>EDPub</div></Link></h1>
          <nav role="navigation">
            { !this.props.minimal
              ? <><ul className="default_header">
                            {activePaths.map(path => <li
                                key={path[0]}
                                className={this.className(path[1])}>{this.linkTo(path)}</li>)}
                            <li className='rightalign nav__order-8'>
                                <ul className='right-ul'>
                                    <li className='overviewLink'>{overviewUrl ? <a href={overviewUrl} aria-label="View the overview pages">Overview</a> : ''}</li>
                                    {authenticated &&
                                        <li><Link to={`/users/id/${userId}`} aria-label="View your conversations">Hi, {user}</Link></li>}
                                    <li className='howToUseLink'>{helpPageDefault ? <a href={helpPageDefault} aria-label="View the how to use page">Help</a> : ''}</li>
                                    <li className='logOut'>{authenticated ? <a onClick={this.logout} aria-label="Log out"><span className="log-icon"></span>Log out</a> : <Link to={'/login'} aria-label="Log in">Log in</Link>}</li></ul>
                            </li>
                        </ul><div id="menuToggle">
                                <input type="checkbox" />

                                <span></span>
                                <span></span>
                                <span></span>

                                <ul id="menu">
                                {activePaths.map(path => <li
                                key={path[0]}
                                className={this.className(path[1])}>{this.linkTo(path)}</li>)}
                                    <li className='overviewLink'>{overviewUrl ? <a href={overviewUrl} aria-label="View the overview pages">Overview</a> : ''}</li>
                                    {authenticated &&
                                        <li><Link to={`/users/id/${userId}`} aria-label="View your conversations">Hi, {user}</Link></li>}
                                    <li className='howToUseLink'>{helpPageDefault ? <a href={helpPageDefault} aria-label="View the how to use page">Help</a> : ''}</li>
                                    <li className='logOut'>{authenticated ? <a onClick={this.logout} aria-label="Log out"><span className="log-icon"></span>Log out</a> : <Link to={'/login'} aria-label="Log in">Log in</Link>}</li>
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
  earthdatapubInstance: PropTypes.object
};

export default withRouter(connect(state => ({
  privileges: state.api.tokens.privileges,
  user: state.api.tokens.userName,
  userId: state.api.tokens.userId
}))(Header));
