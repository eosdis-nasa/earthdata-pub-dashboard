'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import {
  listRequests
} from '../../actions';
import {
  lastUpdated,
  shortDateNoTimeYearFirst,
  bool,
  displayCase
} from '../../utils/format';
import {
  tableColumns
} from '../../utils/table-config/requests';
import List from '../Table/Table';
import Select from 'react-select';
import { strings } from '../locale';
import { workflowOptionNames } from '../../selectors';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
import Loading from '../LoadingIndicator/loading-indicator';

class ActionRequestsOverview extends React.Component {
  constructor () {
    super();
    this.displayName = strings.all_requests;
    this.generateQuery = this.generateQuery.bind(this);
    this.getView = this.getView.bind(this);
    this.state = { producers: [], originalList: {}, list: {} };
    this.handleProducerSelect = this.handleProducerSelect.bind(this);
    this.setRequests = this.setRequests.bind(this);
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

  async componentDidMount () {
    this.setRequests();
  }

  async setRequests (filter = []) {
    const { dispatch } = this.props;
    await dispatch(listRequests());
    const { requests } = this.props;
    const { list } = requests;
    const originalList = this.filter(list);
    this.setState({ originalList: originalList, list: originalList, view: this.getView(), filter: filter });
  }

  generateQuery (list) {
    const options = {};
    const view = this.getView();
    if (view !== this.state.view) {
      this.setRequests(this.state.list);
    }
    if (view && view !== 'all') options.status = view;
    options.status = view;
    return list;
  }

  filter (list, match) {
    const { pathname } = this.props.location;
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
        if (typeof record[r] === 'object') {
          if (match === undefined && this.state.filter !== undefined && this.state.filter.length > 0) {
            match = this.state.filter;
          }
          // Once closing sets records to hidden once more, one can take out else statement.  status on close says ready now.
          const prod = { value: record[r].form_data.data_producer_info_name, label: record[r].form_data.data_producer_info_name };
          let dataProduct = record[r].form_data.data_product_name_value;
          if (dataProduct === undefined) {
            dataProduct = 'Request Initialized';
          }
          const isFound = this.state.producers.some(element => {
            if (element.value === prod.value) {
              return true;
            }
            return false;
          });
          if (!isFound && JSON.stringify(prod) !== '{}') {
            this.state.producers.push(prod);
          }
          if (typeof record[r] === 'object') {
            if (pathname !== '/requests/status/closed') {
              if (!record[r].hidden && record[r].status === this.getView() && ((requestSearchValue !== '' && dataProduct.match(re)) || requestSearchValue === '')) {
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
            } else {
              if ((record[r].hidden || record[r].step_name.match(/close/)) && ((requestSearchValue !== '' && dataProduct.match(re)) || requestSearchValue === '')) {
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

  handleProducerSelect (list, e) {
    if (e.length === 0) {
      this.setState({ list: this.filter(this.state.originalList), filter: [] });
    } else if (e[0] !== undefined) {
      this.setState({ list: this.filter(list, Object.values(e)), filter: Object.values(e) });
    }
  }

  render () {
    if (this.state.list !== undefined && this.state.list.meta !== undefined && this.state.list.data !== undefined) {
      if (document.querySelector('.request-section input.search') !== undefined && document.querySelector('.request-section input.search') !== null) {
        const searchElement = document.querySelector('.request-section input.search');

        searchElement.addEventListener('change', () => {
          this.setState({ list: this.filter(this.state.originalList) });
        });
      }
      const view = this.getView();
      const displayCaseView = displayCase(view);
      const breadcrumbConfig = [
        {
          label: 'Dashboard Home',
          href: '/'
        },
        {
          label: 'Requests',
          href: '/requests'
        },
        {
          label: displayCaseView,
          active: true
        }
      ];
      const list = this.state.list;
      const { queriedAt } = list.meta;
      const unique = [...new Set(list.data.map(item => item.id))];
      const query = this.generateQuery(list);
      return (
        <div className='page__component'>
          <section className='page__section page__section__controls'>
            <Breadcrumbs config={breadcrumbConfig} />
          </section>
          <section className='page__section page__section__header-wrapper'>
            <div className='page__section__header'>
              {/* <h1 className='heading--large heading--shared-content with-description '>{strings.requests_actions}</h1> */}
              <h1 className='heading--large heading--shared-content with-description '>
                {displayCaseView}
              </h1>
              {lastUpdated(queriedAt)}
              {/* <Overview items={overviewItems} inflight={false} /> */}
            </div>
          </section>
          <section className='page__section page__section__controls request-section'>
            <div className='heading__wrapper--border'>
              <h2 className='heading--medium heading--shared-content with-description'>Action <span className='num--title'>{unique.length}</span></h2>
            </div>
            {!list
              ? <Loading />
              : <List
                list={this.filter(this.state.originalList)}
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
                className='producer_select'
                isMulti={true}
              />
            </List>
            }
          </section>
        </div>
      );
    }
    return null;
  }
}

ActionRequestsOverview.propTypes = {
  requests: PropTypes.object,
  stats: PropTypes.object,
  dispatch: PropTypes.func,
  workflowOptions: PropTypes.array,
  location: PropTypes.object,
  config: PropTypes.object,
  requestCSV: PropTypes.object,
  privileges: PropTypes.object,
  roles: PropTypes.array,
  onQueryChange: PropTypes.func
};

export { ActionRequestsOverview };

export default withRouter(connect(state => ({
  stats: state.stats,
  workflowOptions: workflowOptionNames(state),
  requests: state.requests,
  config: state.config,
  requestCSV: state.requestCSV,
  privileges: state.api.tokens.privileges,
  roles: state.api.tokens.roles,
}))(ActionRequestsOverview));
