import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import _config from '../js/config';
import { displayCase } from './utils/format';
import Header from './components/Header/header';
import Footer from './components/Footer/footer';
import TopButton from './components/TopButton/TopButton';
import TimeoutWarning from './components/TimeoutWarning';

const { target, environment } = _config;

class Main extends Component {
  constructor () {
    super();
    this.displayName = 'Main';
  }

  render () {
    return (
      <div className='app'>
        <TimeoutWarning />
        {target !== 'earthdata-pub' ? (
          <div className='app__target--container' role="banner">
            <h4 className='app__target'>{displayCase(target)} ({displayCase(environment)})</h4>
          </div>
        ) : null}
        <Header dispatch={this.props.dispatch} api={this.props.api} location={this.props.location} earthdatapubInstance={this.props.earthdatapubInstance}/>
        <main className='main' role='main'>
          {this.props.children}
        </main>
        <section className='page__section--top' role="navigation" aria-label="Click to go to top of page">
          <TopButton />
        </section>
        <Footer api={this.props.api} apiVersion={this.props.apiVersion} />
      </div>
    );
  }
}

Main.propTypes = {
  children: PropTypes.oneOfType([PropTypes.array, PropTypes.node]),
  dispatch: PropTypes.func,
  location: PropTypes.object,
  api: PropTypes.object,
  apiVersion: PropTypes.object,
  earthdatapubInstance: PropTypes.object
};

export default withRouter(connect(state => state)(Main));
