'use strict';
import React from 'react';
import c from 'classnames';
import PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { logout, getApiVersion } from '../../actions';
import { nav, overviewUrl } from '../../config';
import mainLogo from '../../../assets/images/nasa-logo.svg';

const paths = [
  ['Requests', '/requests', 'REQUEST'],
  ['Workflows', '/workflows', 'WORKFLOW'],
  ['Metrics', '/metrics', 'METRICS'],
  ['Users', '/users', 'USER'],
  ['Groups', '/groups', 'GROUP'],
  ['Roles', '/roles', 'ROLE']
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
    localStorage.removeItem('auth-token');
    // window.location.href = overviewUrl;
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
      search: this.props.location.search
    }}>{path[0]}</Link>;
  }

  render () {
    const { authenticated } = this.props.api;
    const { privileges, user } = this.props;
    const activePaths = paths.filter(path => {
      return !!privileges[path[2]] || privileges.ADMIN;
    });
    const feedbackUrl = overviewUrl + '/feedback';
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
                  <li className='overviewLink'>{ overviewUrl ? <a href="https://app.smartsheet.com/b/form/4978cb9677ad4198a96afd40102e9f2d" target="_blank">Feedback</a> : '' }</li>
                  {authenticated &&
                    <li><Link to={'/conversations'}>Hi, {user}</Link></li>
                  }
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
  privileges: PropTypes.object,
  user: PropTypes.string,
  earthdatapubInstance: PropTypes.object
};

export default withRouter(connect(state => ({
  privileges: state.api.tokens.privileges,
  user: state.api.tokens.userName
}))(Header));
