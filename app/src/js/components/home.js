'use strict';
import React from 'react';
// import { get } from 'object-path';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import withQueryParams from 'react-router-query-params';
import { interval, listSubmissions } from '../actions';
import {
  // tally,
  // seconds
  shortDateNoTimeYearFirst,
  nullValue,
  // displayCase,
  bool
} from '../utils/format';
import List from './Table/Table';
// import SubmissionsProgress from './Requests/progress';
import { errorTableColumns } from '../utils/table-config/requests';
import { updateInterval, overviewUrl } from '../config';
/* import {
  kibanaS3AccessErrorsLink,
  kibanaS3AccessSuccessesLink,
  kibanaApiLambdaErrorsLink,
  kibanaApiLambdaSuccessesLink,
  kibanaTEALambdaErrorsLink,
  kibanaTEALambdaSuccessesLink,
  kibanaGatewayAccessErrorsLink,
  kibanaGatewayAccessSuccessesLink,
  kibanaGatewayExecutionErrorsLink,
  kibanaGatewayExecutionSuccessesLink,
  kibanaAllLogsLink,
} from '../utils/kibana'; */
// import { initialValuesFromLocation } from '../utils/url-helper';
// import Datepicker from './Datepicker/Datepicker';
import { strings } from './locale';

class Home extends React.Component {
  constructor (props) {
    super(props);
    this.displayName = 'Home';
    this.query = this.query.bind(this);
    this.generateQuery = this.generateQuery.bind(this);
    this.refreshQuery = this.refreshQuery.bind(this);
  }

  getView () {
    const { pathname } = this.props.location;
    if (pathname === '/requests/completed') return 'completed';
    else if (pathname === '/requests/processing') return 'running';
    else if (pathname === '/requests/failed') return 'failed';
    else return 'all';
  }

  componentDidMount () {
    // const { dispatch } = this.props;
    this.cancelInterval = interval(this.query, updateInterval, true);
  }

  componentWillUnmount () {
    if (this.cancelInterval) { this.cancelInterval(); }
  }

  query () {
    const { dispatch } = this.props;
    dispatch(listSubmissions(this.generateQuery()));
  }

  refreshQuery () {
    if (this.cancelInterval) { this.cancelInterval(); }
    this.cancelInterval = interval(this.query, updateInterval, true);
  }

  /* original query
  generateQuery () {
    return {
      error__exists: true,
      status: 'failed',
      limit: 20
    };
  }
  */
  generateQuery () {
    return {
      status: 'running',
      limit: 5
    };
  }

  redirect (e) {
    e.preventDefault();
    window.location.href = overviewUrl;
  }

  isExternalLink (link) {
    return link && link.match('https?://');
  }

  renderOverview () {
    if (typeof overviewUrl === 'undefined') return null;
    return (
      <section className='page__section instructions'>
        <div className='row'>
          <div className='heading__wrapper--border'>
            <h2 className='heading--large heading--shared-content--right'>Overview</h2>
          </div>
          <div className='heading--overview'>
            <div>
              This is a paragraph explaining Earthdata Pub. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </div><br />
            <div className='heading--overview--wbutton'>
              For more information read the <button id="overview_button" className='button button--small button--eui-green' onClick={this.redirect} >EDPUB Overview</button>
            </div>
          </div>
        </div>
        <div className='row'>
          <div className='heading__wrapper--border'></div>
        </div>
      </section>
    );
  }

  renderButtonListSection (items, header, listId) {
    const data = items.filter(d => d[0] !== nullValue);
    if (!data.length) return null;
    return (
      <section className='page__section'>
        <div className='row'>
          <div className='heading__wrapper'>
            <h2 className='heading--medium heading--shared-content--right'>{header}</h2>
          </div>
          <div className="overview-num__wrapper-home">
            <ul id={listId}>
              {data.map(d => {
                const value = d[0];
                return (
                  <li key={d[1]}>
                    {this.isExternalLink(d[2]) ? (
                      <a id={d[1]} href={d[2]} className='overview-num' target='_blank'>
                        <span className='num--large'>{value}</span> {d[1]}
                      </a>
                    ) : (
                      <Link id={d[1]} className='overview-num' to={{ pathname: d[2], search: this.props.location.search }}>
                        <span className='num--large'>{value}</span> {d[1]}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>
    );
  }

  render () {
    const { requests } = this.props;
    const { list } = requests;
    const view = this.getView();
    const query = this.generateQuery();
    const tableColumns = [
      {
        Header: 'Status',
        accessor: row => <Link to={`/requests/id/${row.id}`} className={`submission__status_message submission__status_message--${row.id}`}>{row.status_message}</Link>,
        id: 'status_message',
        width: 100
      },
      {
        Header: 'Workflow',
        accessor: row => <Link to={`/workflows/id/${row.workflow_id}`} className={`submission__workflow submission__workflow--${row.workflow_id}`}>{row.workflow_name}</Link>,
        id: 'workflow_name',
        width: 100
      },
      {
        Header: 'Step',
        accessor: row => row.step_name,
        id: 'step_name',
        width: 100
      },
      {
        Header: 'Name',
        accessor: row => row.name || '(no name)',
        id: 'name',
        width: 225
      },
      {
        Header: 'Created',
        accessor: row => shortDateNoTimeYearFirst(row.created_at),
        id: 'created_at'
      },
      {
        Header: 'Latest Edit',
        accessor: row => shortDateNoTimeYearFirst(row.last_change),
        id: 'last_change'
      },
      {
        Header: 'Locked',
        accessor: row => bool(row.lock),
        id: 'lock'
      }
    ];
    // const { stats, count } = this.props.stats;
    // const { dist } = this.props;
    /* const overview = [
      [tally(get(stats.data, 'errors.value')), 'Errors', kibanaAllLogsLink(this.props.earthdatapubInstance)],
      [tally(get(stats.data, 'requests.value')), strings.requests, '/requests'],
      [tally(get(this.props.executions, 'list.meta.count')), 'Executions', '/executions'],
      [tally(get(this.props.rules, 'list.meta.count')), 'Ingest Rules', '/rules'],
      [seconds(get(stats.data, 'processingTime.value', nullValue)), 'Average processing Time', '/']
    ];

    const distSuccessStats = [
      [tally(get(dist, 's3Access.successes')), 'S3 Access Successes', kibanaS3AccessSuccessesLink(this.props.earthdatapubInstance, this.props.datepicker)],
      [tally(get(dist, 'teaLambda.successes')), 'TEA Lambda Successes', kibanaTEALambdaSuccessesLink(this.props.earthdatapubInstance, this.props.datepicker)],
      [tally(get(dist, 'apiLambda.successes')), 'Distribution API Lambda Successes', kibanaApiLambdaSuccessesLink(this.props.earthdatapubInstance, this.props.datepicker)],
      [tally(get(dist, 'apiGateway.execution.successes')), 'Gateway Execution Successes', kibanaGatewayExecutionSuccessesLink(this.props.earthdatapubInstance, this.props.datepicker)],
      [tally(get(dist, 'apiGateway.access.successes')), 'Gateway Access Successes', kibanaGatewayAccessSuccessesLink(this.props.earthdatapubInstance, this.props.datepicker)]
    ];

    const distErrorStats = [
      [tally(get(dist, 's3Access.errors')), 'S3 Access Errors', kibanaS3AccessErrorsLink(this.props.earthdatapubInstance, this.props.datepicker)],
      [tally(get(dist, 'teaLambda.errors')), 'TEA Lambda Errors', kibanaTEALambdaErrorsLink(this.props.earthdatapubInstance, this.props.datepicker)],
      [tally(get(dist, 'apiLambda.errors')), 'Distribution API Lambda Errors', kibanaApiLambdaErrorsLink(this.props.earthdatapubInstance, this.props.datepicker)],
      [tally(get(dist, 'apiGateway.execution.errors')), 'Gateway Execution Errors', kibanaGatewayExecutionErrorsLink(this.props.earthdatapubInstance, this.props.datepicker)],
      [tally(get(dist, 'apiGateway.access.errors')), 'Gateway Access Errors', kibanaGatewayAccessErrorsLink(this.props.earthdatapubInstance, this.props.datepicker)]
    ]; */

    // const submissionCount = get(count.data, 'requests.meta.count');
    // const numSubmissions = !isNaN(submissionCount) ? `${tally(submissionCount)}` : 0;
    // const submissionStatus = get(count.data, 'requests.count', []);

    return (
      <div className='page__home'>
        <div className='content__header content__header--lg'>
          <div className='row'>
            <h1 className='heading--xlarge'>{strings.dashboard}</h1>
          </div>
        </div>

        <div className='page__content page__content__nosidebar home_submissions_table'>
          {this.renderOverview()}
          {/*
          <section className='page__section datetime'>
            <div className='row'>
              <div className='heading__wrapper'>
                <h2 className='datetime__info heading--medium heading--shared-content--right'>
                  Select date and time to refine your results. <em>Time is UTC.</em>
                </h2>
              </div>
              <Datepicker onChange={this.refreshQuery}/>
            </div>
          </section>

          <section className='page__section metrics--overview'>
            <div className='row'>
              <div className='heading__wrapper--border'>
                <h2 className='heading--large heading--shared-content--right'>Metrics</h2>
              </div>
            </div>
          </section>

          {this.renderButtonListSection(overview, 'Updates')}
          {this.renderButtonListSection(distErrorStats, 'Distribution Errors', 'distributionErrors')}
          {this.renderButtonListSection(distSuccessStats, 'Distribution Successes', 'distributionSuccesses')}

          <section className='page__section update--requests'>
            <div className='row'>
              <div className='heading__wrapper--border'>
                <h2 className='heading--large heading--shared-content--right'>Requests Updates</h2>
                <Link className='link--secondary link--learn-more' to='/requests' aria-label="Learn more about requests">{strings.view_submissions_overview}</Link>
              </div>
              <div className="heading__wrapper">
                <h2 className='heading--medium heading--shared-content--right'>{strings.submissions_updated}<span className='num--title'>{numSubmissions}</span></h2>
              </div>

              <SubmissionsProgress requests={submissionStatus} />
            </div>
          </section> */}
          <section className='page__section list--requests'>
            <div className='row'>
              <div className='heading__wrapper--border'>
                <h2 className='heading--medium heading--shared-content--right'>{strings.submissions_inprogress}</h2>
                <Link className='link--secondary link--learn-more' to='/logs' aria-label="Learn more about logs">{strings.view_logs}</Link>
              </div>
              <List
                list={list}
                dispatch={this.props.dispatch}
                action={listSubmissions}
                tableColumns={view === 'failed' ? errorTableColumns : tableColumns}
                query={query}
                sortIdx='timestamp'
                rowId='requestId'
              />
            </div>
          </section>
        </div>
      </div>
    );
  }
}

Home.propTypes = {
  earthdatapubInstance: PropTypes.object,
  datepicker: PropTypes.object,
  dist: PropTypes.object,
  executions: PropTypes.object,
  granules: PropTypes.object,
  requests: PropTypes.object,
  pdrs: PropTypes.object,
  rules: PropTypes.object,
  stats: PropTypes.object,
  queryParams: PropTypes.object,
  setQueryParams: PropTypes.func,
  dispatch: PropTypes.func,
  location: PropTypes.object
};

export { Home };

export default withRouter(withQueryParams()(connect((state) => ({
  earthdatapubInstance: state.earthdatapubInstance,
  datepicker: state.datepicker,
  dist: state.dist,
  executions: state.executions,
  granules: state.granules,
  requests: state.requests,
  pdrs: state.pdrs,
  rules: state.rules,
  stats: state.stats
}))(Home)));
