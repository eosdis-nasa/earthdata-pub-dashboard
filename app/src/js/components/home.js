'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import withQueryParams from 'react-router-query-params';
import { listRequests } from '../actions';
import {
  nullValue,
} from '../utils/format';
import List from './Table/Table';
import {
  tableColumns
} from '../utils/table-config/requests';
import { overviewUrl } from '../config';
import Select from 'react-select';
import { strings } from './locale';
import { requestPrivileges } from '../utils/privileges';
import Loading from '../components/LoadingIndicator/loading-indicator';

class Home extends React.Component {
  constructor (props) {
    super(props);
    this.state = { producers: [], originalList: {}, list: {}, intervalId: null };
    this.displayName = 'Home';
    this.generateQuery = this.generateQuery.bind(this);
    this.handleProducerSelect = this.handleProducerSelect.bind(this);
    this._isMounted = false;
    this.timeoutId = null; 
  }

  getView () {
    const { pathname } = this.props.location;
    if (pathname === '/requests/status/action') return 'Processing Action';
    else if (pathname === '/requests/status/form') return 'Pending Form Submittal';
    else if (pathname === '/requests/status/review') return 'Pending Review';
    else if (pathname === '/requests/status/service') return 'Pending Service Completion';
    else if (pathname === '/requests/status/closed') return 'Closed';
    else if (pathname === '/requests/status/withdrawn') return 'Withdrawn';
    else return 'all';
  }

async componentDidMount() {
  this._isMounted = true; // Set mounted flag

  await this.updateList();

  let elapsedTime = 0;
  const intervals = [5000, 10000, 15000, 30000, 60000];
  
  let currentIntervalIndex = 0;

  const intervalId = async () => {
    if (!this._isMounted) return; // Prevent updates if unmounted

    const { list } = this.props.requests;
    const hasActionId = list.data.some(item => item.step_data && item.step_data.action_id);

    if (hasActionId) {
      await this.updateList();
    }

    elapsedTime += intervals[currentIntervalIndex];
    currentIntervalIndex++;

    if (currentIntervalIndex < intervals.length && this._isMounted) {
      this.timeoutId = setTimeout(intervalId, intervals[currentIntervalIndex]);
    }
  };

  // Start the first interval
  this.timeoutId = setTimeout(intervalId, intervals[currentIntervalIndex]);
}
  
  async updateList() {
    const { dispatch } = this.props;

    try {
      await dispatch(listRequests());
      const { requests } = this.props;
      const { list } = requests;
      const originalList = this.filter(list);

      // Only update state if the component is still mounted
      if (this._isMounted) {
        this.setState({ originalList, list: originalList });
      }
    } catch (error) {
      console.error('Error updating the list:', error);
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }
  
  generateQuery() {
    return {};
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
              Earthdata Pub allows you to track the status of your data product through the data publication process, create new requests, and communicate with DAAC staff.
            </div><br />
            <div className='heading--overview--wbutton'>
              For more information read the <button id="overview_button" className='button button--small button--eui-green' onClick={this.redirect} >Earthdata Pub Overview</button>
            </div>
          </div>
        </div>
        <div className='row'>
          <div className='heading__wrapper--border'></div>
        </div>
      </section>
    );
  }

  renderUserInfo () {
    const { groups, roles } = this.props;
    return (
      <section className='page__section instructions'>
        <div className='row'>
          <div className='heading__wrapper--border'>
            <h2 className='heading--medium heading--shared-content--right'>User Info</h2>
          </div>
          <div className='flex__row'>
            <div className='flex__item--spacing flex__column--sm-border'>
              <div className='heading--small heading--shared-content--right'>Groups</div>
              { groups.map((group, key) => <div key={key} className='flex__item--spacing'>{ group.long_name }</div>)}
            </div>
            <div className='flex__item--spacing flex__column--sm-border'>
              <div className='heading--small heading--shared-content--right'>Roles</div>
              { roles.map((role, key) => <div key={key} className='flex__item--spacing'>{ role.long_name }</div>)}
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
                    {this.isExternalLink(d[2])
                      ? (
                      <a id={d[1]} href={d[2]} className='overview-num' target='_blank' aria-label={d[1]}>
                        <span className='num--large'>{value}</span> {d[1]}
                      </a>
                        )
                      : (
                      <Link id={d[1]} className='overview-num' to={{ pathname: d[2], search: this.props.location.search }} aria-label="View your overview">
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

  handleProducerSelect(list, e) {
    if (e.length === 0) {
      this.setState({ list: this.filter(this.state.originalList) });
    } else if (e[0] !== undefined) {
      this.setState({ list: this.filter(list, Object.values(e)) });
    }
  }

  filter (list, match) {
    const newList = {};
    const tmp = [];
    let requestSearchValue = '';
    if (document.querySelector('.request-section input.search') !== undefined && document.querySelector('.request-section input.search') !== null) {
      requestSearchValue = document.querySelector('.request-section input.search').value;
    }
    const re = new RegExp(requestSearchValue, 'gi');
    for (const ea in list) {
      const record = list[ea];
      newList[ea] = record;
      for (const r in record) {
        if (!record[r].hidden && record[r].step_name !== 'close' && typeof record[r] === 'object') {
          if (match === undefined && this.state.filter !== undefined && this.state.filter.length > 0) {
            match = this.state.filter;
          }
          const prod = { value: record[r]?.data_producer_name, label: record[r]?.data_producer_name };
          let dataProduct = record[r]?.name;
          if (dataProduct === undefined) {
            dataProduct = `Request Initialized by ${record[r].initiator.name}`;
          }
          const isFound = this.state.producers.some(element => {
            if (element.value === prod.value) {
              return true;
            }
            return false;
          });
          if (!isFound && JSON.stringify(prod) !== '{}' && prod.value !== null) {
            this.state.producers.push(prod);
          }
          if ((requestSearchValue !== '' && dataProduct.match(re)) || requestSearchValue === '') {
            if (match === undefined) {
              tmp.push(record[r]);
            } else {
              for (const i in match) {
                if (prod.value === match[i].value) {
                  tmp.push(record[r]);
                }
              }
            }
          }
        }
      }
    }
    Object.defineProperty(newList, 'data', {
      value: tmp,
      writable: true,
      enumerable: true,
      configurable: true
    });
    return newList;
  }

  render () {
    if (this.state.list !== undefined && this.state.list.meta !== undefined && this.state.list.data !== undefined) {
      if (document.querySelector('.request-section input.search') !== undefined && document.querySelector('.request-section input.search') !== null) {
        const searchElement = document.querySelector('.request-section input.search');

        searchElement.addEventListener('change', () => {
          this.setState({ list: this.filter(this.state.originalList) });
        });
      }
      const query = this.generateQuery();
      const { canInitialize } = requestPrivileges(this.props.privileges);
      const list = this.state.list;
      return (
        <div className='page__home'>
          <div className='content__header content__header--lg'>
            <div className='row'>
              <h1 className='heading--xlarge'>{strings.dashboard}</h1>
            </div>
          </div>

          <div className='page__content page__content__nosidebar home_requests_table'>
            {this.renderOverview()}
            {this.renderUserInfo()}
            <section className='page__section list--requests request-section'>
              <div className='row'>
                <div className='heading__wrapper--border'>
                  <h2 className='heading--medium heading--shared-content--right'>{strings.requests_inprogress}</h2>
                  { canInitialize ? (
                    <Link
                      to='/daac/selection'
                      className='button button--small button--green button--add-small form-group__element--right new-request-button'
                      aria-label='Create new request'>
                      New Request
                    </Link>
                  ) : null}
                  <Link className='link--secondary link--learn-more' to='/logs' aria-label="Learn more about logs">{strings.view_logs}</Link>
                </div>
                {!list
                  ? <Loading />: 
                  <List
                    list={list}
                    tableColumns={tableColumns}
                    query={query}
                    rowId='id'
                    filterIdx='name'
                    filterPlaceholder='Search Requests'
                    >
                    <Select
                      id="producerSelect"
                      options={this.state.producers}
                      onChange={(e) => this.handleProducerSelect(this.state.originalList, e)}
                      isSearchable={true}
                      placeholder='Select Data Producer'
                      className='selectButton'
                      aria-label='Select Data Producer'
                      isMulti={true}
                    />
                  </List>
                }
              </div>
            </section>
          </div>
        </div>
      );
    }
    return <Loading />;
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
  privileges: PropTypes.object,
  roles: PropTypes.array,
  groups: PropTypes.array,
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
  stats: state.stats,
  privileges: state.api.tokens.privileges,
  roles: state.api.tokens.roles,
  groups: state.api.tokens.groups
}))(Home)));
