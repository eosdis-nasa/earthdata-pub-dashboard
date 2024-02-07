'use strict';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withRouter, useHistory } from 'react-router-dom';
import { connect } from 'react-redux';
import Loading from '../LoadingIndicator/loading-indicator';
import SearchModal from '../SearchModal';
import { lastUpdated } from '../../utils/format';

import {
  listCloudMetrics,
  listDaacs,
  listWorkflows,
  // getRequestDetails,
  // searchRequests,
  // clearRequestsSearch,
} from '../../actions';
import List from '../Table/Table';
import Select from 'react-select';
import { metricOptionNames, workflowOptionNames, stateOptionNames, daacOptionNames } from '../../selectors';
import Search from '../Search/search';
import { tableColumns, requestTableColumns, timeColumns, countColumns } from '../../utils/table-config/metrics';
import { strings } from '../locale';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';

const MetricOverview = ({ dispatch, match, daacs, workflows, requests, metrics, states }) => {
  const { requestId } = match.params.requestId ? match.params.requestId : '';
  const metric = match.params.metric ? match.params.metric : undefined;
  useEffect(() => {
    dispatch(listDaacs());
    dispatch(listWorkflows());
    // dispatch(getRequestDetails(requestId));
    dispatch(listCloudMetrics(metric));
  }, []);

  useEffect(() => {
    setDaacOptions(daacs.map(({ id, short_name }) => ({ value: id, label: short_name })));
    setWorkflowOptions(workflows.map(({ id, long_name }) => ({ value: id, label: long_name })));
    // requests.searchString,
    setMetricOptions(metricOptionNames);
    setStateOptions(stateOptionNames);
  }, [daacs, workflows, requests, metrics, states]);

  const history = useHistory();
  // const [showSearch, setShowSearch] = useState(false);
  // const [searchOptions, setSearchOptions] = useState({});
  const [daacOptions, setDaacOptions] = useState([]);
  const [selectedDaacs, setSelectedDaacs] = useState([]);
  const [workflowOptions, setWorkflowOptions] = useState([]);
  const [selectedWorkflows, setSelectedWorkflows] = useState([]);
  // const [request, setRequest] = useState('');
  // const [validRequest, setValidRequest] = useState(true);
  const [metricOptions, setMetricOptions] = useState([]);
  const [selectedMetrics, setSelectedMetrics] = useState([]);
  const [stateOptions, setStateOptions] = useState([]);
  const [selectedStates, setSelectedStates] = useState([]);

  useEffect(() => {
    handleSubmit()
  }, [selectedDaacs, selectedMetrics, selectedWorkflows, selectedStates])

  const breadcrumbConfig = [
    {
      label: 'Dashboard Home',
      href: '/'
    },
    {
      label: 'Metrics',
      active: true
    }
  ];

  /* const extractId = (list) => {
    const rtnList = [];
    list.forEach(item => {
      rtnList.push(item.value);
    });
    return rtnList;
  }; */

  const handleDaacSelect = (data) => {
    setSelectedDaacs(data);
  };

  const handleWorkflowSelect = (data) => {
    setSelectedWorkflows(data);
  };

  const handleRequest = (value) => {
    setRequest(value);
  };

  const handleMetricSelect = (data) => {
    setSelectedMetrics(data);
  };

  const handleStateSelect = (data) => {
    setSelectedStates(data);
  };

  const handleSubmit = async () => {
    const payload = {
      daac_id: selectedDaacs?.value,
      workflow_id: selectedWorkflows?.value,
      metric: selectedMetrics?.value,
      state: selectedStates?.value
    };
    history.push('/metrics');
    await dispatch(listCloudMetrics(payload))
  };
  
  
  return (
    <div className='page__component'>
      <section className='page__section page__section__controls'>
        <Breadcrumbs config={breadcrumbConfig} />
      </section>
      <section className='page__section page__section__header-wrapper'>
        <div className='page__section__header'>
          <h1 className='heading--large heading--shared-content with-description '>{strings.metric_overview}</h1>
        </div>
      </section>
      {/* {showSearch && <SearchModal {...searchOptions} />} */}
      <section className='page__section'>
        <div className='heading__wrapper--border'>
          <h2 className='heading--medium heading--shared-content with-description'>{strings.all_metrics} <span className='num--title'>{metrics?.list?.data?.length}</span></h2>
        </div>
        {metrics?.list ?
        <List
          list={metrics?.list}
          dispatch={dispatch}
          action={listCloudMetrics}
            tableColumns={selectedMetrics?.value && selectedMetrics?.value.match(/time_to_publish/g) ? timeColumns : selectedMetrics?.value && selectedMetrics?.value.match(/user_count/g) ? countColumns : requestTableColumns}
          query={{}}
          bulkActions={[]}
          rowId='event'
        >
            <div className="filterGrid">
            {/* <Search
              dispatch={dispatch}
              action={handleRequest}
              clear={clearRequestsSearch}
              label='Search'
              placeholder="Request ID"
            
  /> */}    
            <label className='heading--small'>State
              <Select
                id="stateSelect"
                options={stateOptions}
                value={selectedStates}
                onChange={handleStateSelect}
                isSearchable={true}
                isMulti={false}
                isClearable={true}
                className='selectButton'
                placeholder='Select State ...'
                aria-label='Select State'
              /></label>
              <label className='heading--small'>Workflows
                <Select
                  id="workflowSelect"
                  options={workflowOptions}
                  value={selectedWorkflows}
                  onChange={handleWorkflowSelect}
                  isSearchable={true}
                  isMulti={false}
                  isClearable={true}
                  className='selectButton'
                  placeholder='Select Workflows ...'
                  aria-label='Select Workflows'
                /></label>
            <label className='heading--small'>Daacs
              <Select
                id="daacSelect"
                options={daacOptions}
                value={selectedDaacs}
                onChange={handleDaacSelect}
                isSearchable={true}
                isMulti={false}
                isClearable={true}
                className='selectButton'
                placeholder='Select Daac ...'
                aria-label='Select Daac'
              /></label>
              <label className='heading--small'>Metrics
                <Select
                  id="metricSelect"
                  options={metricOptions}
                  value={selectedMetrics}
                  onChange={handleMetricSelect}
                  isSearchable={true}
                  isMulti={false}
                  isClearable={true}
                  className='selectButton'
                  placeholder='Select Metrics ...'
                  aria-label='Select Metrics'
                /></label>
            </div>
        </List>
          : <Loading />}
      </section>
    </div>
  );
};

MetricOverview.propTypes = {
  dispatch: PropTypes.func,
  metrics: PropTypes.object,
  privileges: PropTypes.object,
  match: PropTypes.object,
  user_groups: PropTypes.array,
  groups: PropTypes.array,
  daacs: PropTypes.array,
  states: PropTypes.array,
  workflows: PropTypes.array,
  requests: PropTypes.object,
  workflowOptions: PropTypes.array,
  stateOptions: PropTypes.array,
  metricOptions: PropTypes.array,
  daacOptions: PropTypes.array,
};

export default withRouter(connect(state => ({
  metrics: state.metrics,
  user_groups: state.api.tokens.groups,
  groups: state.groups.list.data,
  daacs: state.daacs.list.data,
  workflows: state.workflows.list.data,
  requests: state.requests,
  states: state.states,
  workflowOptions: workflowOptionNames(state),
  stateOptions: stateOptionNames(state),
  metricOptions: metricOptionNames(state),
  daacOptions: daacOptionNames(state),
}))(MetricOverview));