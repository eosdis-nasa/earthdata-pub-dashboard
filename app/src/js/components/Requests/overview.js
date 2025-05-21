'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import {
  // getCount,
  // searchRequests,
  // clearRequestsSearch,
  // filterRequests,
  // clearRequestsFilter,
  listRequests,
  // filterStatuses,
  // clearStagesFilter,
  // clearStatusesFilter,
  // listWorkflows,
  // getOptionsRequestName,
  initialize,
} from '../../actions';
// import { get } from 'object-path';
import {
  lastUpdated,
  // tally,
  // displayCase
} from '../../utils/format';
import {
  tableColumns
} from '../../utils/table-config/requests';
import List from '../Table/Table';
import Select from 'react-select';
// import Search from '../Search/search';
// import Overview from '../Overview/overview';
// import statusOptions from '../../utils/status';
// import stageOptions from '../../utils/stage';
import _config from '../../config';
import { strings } from '../locale';
import { workflowOptionNames } from '../../selectors';
// import { window } from '../../utils/browser';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
// import pageSizeOptions from '../../utils/page-size';
import { requestPrivileges } from '../../utils/privileges';
import Loading from '../LoadingIndicator/loading-indicator';
import { Modal, Button } from 'react-bootstrap';
import { faTimes, faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

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
    label: strings.requests_inprogress2,
    href: '/requests',
    active: true
  }
];

class RequestsOverview extends React.Component {
  constructor () {
    super();
    this.state = {
      producers: [],
      originalList: {},
      list: {},
      codeValue: '',
      codeError:''
    };
    this.generateQuery = this.generateQuery.bind(this);
    this.handleProducerSelect = this.handleProducerSelect.bind(this);
    this.toggleDropdown = this.toggleDropdown.bind(this);
    this.handleSelection = this.handleSelection.bind(this);
    this.handleOutsideClick = this.handleOutsideClick.bind(this);
    this.handleCodeChange = this.handleCodeChange.bind(this);
    this.submitCode = this.submitCode.bind(this);
    this.closeModal = this.closeModal.bind(this);

    this._isMounted = false;
    this.timeoutId = null; 
  }

  toggleDropdown(event) {
    event.stopPropagation(); 
    const { isDropdownOpen } = this.state;
    if (!isDropdownOpen) {
      document.addEventListener('click', this.handleOutsideClick);
    } else {
      document.removeEventListener('click', this.handleOutsideClick);
    }

    this.setState({ isDropdownOpen: !isDropdownOpen });
  }

  handleOutsideClick() {
    if(this._isMounted){
      this.setState({ isDropdownOpen: false });
      document.removeEventListener('click', this.handleOutsideClick);
    }
  }

  handleCodeChange(event) {
    this.setState({ codeValue: event.target.value });
  }
  
  async submitCode() {
    const { codeValue } = this.state;
    const { dispatch } = this.props;  
  
      // Log publication code submission
      console.log('Publication code submitted:', codeValue);
      const result = await dispatch(initialize({ 'code': codeValue }));

      if(result && result.data && !result.data.error){
        this.setState({ isModalOpen: false, codeValue: '' });
        await this.updateList();
        const { basepath } = _config;
    
        const url = `${basepath}form/questions/${result.data.id}`;
        window.location.href = url;
      }else{
        this.setState({ codeError: result.data.error });
      }
  }
  
  closeModal() {
    this.setState({ isModalOpen: false, codeValue: '', codeError:'' });
  }

  async handleSelection(e, req) {
    const { dispatch } = this.props;  
    e.preventDefault();

    this.setState({ isDropdownOpen: false });
    if(req === 'DAR'){
      const init = await dispatch(initialize());
      await this.updateList();
      const { basepath } = _config;
    
      const url = `${basepath}form/questions/${init.data.id}`;
      window.location.href = url;
    }else if(req === 'DPR'){
      this.setState({ isModalOpen: true });
    }
   
    //this.props.history.push(path);  // Redirect based on selection
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
    await dispatch(listRequests());
    const { requests } = this.props;
    const { list } = requests;
    const originalList = this.filter(list);
    this.setState({ originalList, list: originalList });
  }
  

  componentWillUnmount() {
    this._isMounted = false;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  generateQuery () {
    return {};
  }

  filter(list, match) {
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

  handleProducerSelect (list, e) {
    if (e.length === 0) {
      this.setState({ list: this.filter(this.state.originalList) });
    } else if (e[0] !== undefined) {
      this.setState({ list: this.filter(list, Object.values(e)) });
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
      const query = this.generateQuery();
      const { canInitialize } = requestPrivileges(this.props.privileges);
      const list = this.state.list;
      const { queriedAt } = list.meta;
      const unique = [...new Set(list.data.map(item => item.id))];
      return (
      <div className='page__component'>
        <section className='page__section page__section__controls'>
          <Breadcrumbs config={breadcrumbConfig} />
        </section>
        <section className='page__section page__section__header-wrapper'>
          <div className='page__section__header'>
            <h1 className='heading--large heading--shared-content with-description '>{strings.requests}</h1>
            {lastUpdated(queriedAt)}
          </div>
        </section>
        <section className='page__section page__section__controls request-section'>
          <div className='heading__wrapper--border'>
            <h2 className='heading--medium heading--shared-content with-description'>{strings.all_requests} <span className='num--title'>{unique.length}</span></h2>
            {canInitialize ? (
                    <div className='dropdown-container'>
                    <button
                      onClick={this.toggleDropdown}
                      className='button button--small button--green button--add-small form-group__element--right new-request-button'
                      aria-label='Create new request'>
                      New Request
                    </button>
              
                    {this.state.isDropdownOpen && (
                      <div className="dropdown-menu">
                        <button onClick={(event) => this.handleSelection(event,'DAR')} className="dropdown-item">
                        Accession Request
                        </button>
                        <button onClick={(event) => this.handleSelection(event,'DPR')} className="dropdown-item">
                        Publication Request
                        </button>
                      </div>
                    )}
                  </div>
                  ) : null}
          </div>
          {!list
            ? <Loading />
            : <List
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
        </section>
        {<Modal show={this.state.isModalOpen} onHide={this.closeModal} className="custom-modal">
          <Modal.Header closeButton>
            <Modal.Title>Enter Publication Code</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Enter the publication code previously received in order to initiate a publication request to a DAAC.</p>
            <br />
            <input
              type="text"
              className="form-control"
              placeholder="Enter publication code"
              value={this.state.codeValue}
              onChange={this.handleCodeChange}
            />
            <span
              className="error-modal"
              style={{ color: this.state.codeError && this.state.codeError === '' ? 'green' : 'red' }}
            >
              {this.state.codeError !== '' ? (
                <FontAwesomeIcon icon={faTimes} />
              ) : this.state.codeError ? (
                <FontAwesomeIcon icon={faCheck} />
              ) : null}
            </span>
          </Modal.Body>
          <Modal.Footer>
            <button
              className="button button--no-icon"
              onClick={this.closeModal}
              style={{backgroundColor: "#db1400"}}>
              Cancel
            </button>
            <button
              className="button button--no-icon"
              style={{ backgroundColor: "#158749" }}
              onClick={this.submitCode}
              disabled= { this.state.codeValue.trim() === '' ? true : false }>
              Submit
            </button>
          </Modal.Footer>
        </Modal>}
      </div>
      );
    }
    return null;
  }
}

RequestsOverview.propTypes = {
  requests: PropTypes.object,
  stats: PropTypes.object,
  dispatch: PropTypes.func,
  workflowOptions: PropTypes.array,
  location: PropTypes.object,
  config: PropTypes.object,
  requestCSV: PropTypes.object,
  privileges: PropTypes.object,
  roles: PropTypes.array
};

export { RequestsOverview };

export default withRouter(connect(state => ({
  stats: state.stats,
  workflowOptions: workflowOptionNames(state),
  requests: state.requests,
  config: state.config,
  requestCSV: state.requestCSV,
  privileges: state.api.tokens.privileges,
  roles: state.api.tokens.roles
}))(RequestsOverview));
