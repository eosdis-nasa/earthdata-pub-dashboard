'use strict';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withRouter, useHistory } from 'react-router-dom';
import { connect } from 'react-redux';
import Loading from '../LoadingIndicator/loading-indicator';
import { displayCase } from '../../utils/format';

import {
  listCloudMetrics,
  listWorkflows,
} from '../../actions';
import List from '../Table/Table';
import Select from 'react-select';
import { metricOptionNames, workflowOptionNames, stateOptionNames, daacOptionNames } from '../../selectors';
import { tableColumns, requestTableColumns, timeColumns, daacTableColumns } from '../../utils/table-config/metrics';
import { strings } from '../locale';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';

const MetricOverview = ({ dispatch, match, daacs, workflows, requests, metrics, states }) => {
  const { requestId } = match.params.requestId ? match.params.requestId : '';
  const metric = match.params.metric ? match.params.metric : undefined;
  useEffect(() => {
    dispatch(listWorkflows());
    dispatch(listCloudMetrics(metric));
  }, []);

  useEffect(() => {
    setDaacOptions(daacOptionNames);
    setWorkflowOptions(workflows.map(({ id, long_name }) => ({ value: id, label: long_name })));
    setMetricOptions(metricOptionNames);
    setStateOptions(stateOptionNames);
  }, [daacs, workflows, requests, metrics, states]);

  const history = useHistory();
  const [daacOptions, setDaacOptions] = useState([]);
  const [selectedDaacs, setSelectedDaacs] = useState([]);
  const [workflowOptions, setWorkflowOptions] = useState([]);
  const [selectedWorkflows, setSelectedWorkflows] = useState([]);
  const [metricOptions, setMetricOptions] = useState([]);
  const [selectedMetrics, setSelectedMetrics] = useState([]);
  const [stateOptions, setStateOptions] = useState([]);
  const [selectedStates, setSelectedStates] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    handleSubmit()
  }, [selectedDaacs, selectedMetrics, selectedWorkflows, selectedStates, startDate, endDate])

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
      state: selectedStates?.value,
      start_date: startDate || null,
      end_date: endDate ? new Date(new Date(endDate).setDate(new Date(endDate).getDate() + 1)).toISOString().slice(0,10) : null
    };
    history.push(history.location);
    await dispatch(listCloudMetrics(payload))
  };

  const getView = () => {
    const { pathname } = history.location;
    if (pathname === '/metrics/daacs') return 'DAAC';
    else if (pathname === '/metrics/users') return 'User';
    else if (pathname === '/metrics') return 'Overview';
    else return 'all';
  };

  const view = getView();

  useEffect(() => {
    setSelectedMetrics({})
    setSelectedDaacs(null);
    setSelectedWorkflows(null);
    setSelectedStates(null);
    setStartDate(null);
    setEndDate(null);

    if (view === 'User') {
      setSelectedMetrics({ value: "user_count", label: "User Count" });
    }

  }, [view]);

  const displayCaseView = displayCase(view);
  const breadcrumbConfig = [
    {
      label: 'Dashboard Home',
      href: '/'
    },
    {
      label: 'Metrics',
      href: '/metrics'
    },
    {
      label: displayCaseView,
      active: true
    }
  ];

// Extract the 'data' array from the metrics.list object
  const { data } = metrics.list;


// Create an object to store counts and total time for each daac_id
  const daacIdInfo = {};
// Filter out duplicates and keep only the first occurrence of each unique daac_id
  const uniqueData = data.filter(item => {
  // Check if the daac_id already exists in the daacIdInfo object
    if (!daacIdInfo[item.daac_id]) {
      // If it doesn't exist, initialize its count to 0 and other properties to 0
        daacIdInfo[item.daac_id] = {
            count: 0,
            completed: 0,
            published: 0,
            time_to_publish: 0
        };
    }
  
  // Increment the count for this daac_id
    daacIdInfo[item.daac_id].count++;
  
  // If the step_name is "close", increment the completed count
    if (item.step_name === "close") {
        daacIdInfo[item.daac_id].completed++;
    }

  // If time_to_publish exists, update the published count and total time components
    if (item.time_to_publish && item.hidden === false) {
        daacIdInfo[item.daac_id].published++;
        daacIdInfo[item.daac_id].time_to_publish += item.time_to_publish !== "" ? parseInt(item.time_to_publish) : 0;
    }
  
  // Return true if this is the first occurrence of the daac_id, false otherwise
    return daacIdInfo[item.daac_id].count === 1;
  });

// Calculate the average time_to_publish for each daac_id group
  Object.keys(daacIdInfo).forEach(daac_id => {
    const info = daacIdInfo[daac_id];
    if (info.count >= 1) {
      info.average_time_to_publish = Math.floor(info.time_to_publish / info.published);
    }
  });

// Add the average_time_to_publish property to each object in the filtered data array
  const dataWithAverageTimeToPublish = uniqueData.map(item => ({
      ...item,
      request_submitted: daacIdInfo[item.daac_id]?.count || null,
      average_time_to_publish: daacIdInfo[item.daac_id]?.average_time_to_publish || null,
      request_completed: daacIdInfo[item.daac_id]?.completed || 0
  }));

// Create a new object with the filtered 'data' array containing average_time_to_publish
  const filteredMetricsList = { ...metrics.list, data: dataWithAverageTimeToPublish };

  const getTableColumns = (selectedMetrics, view) =>
    selectedMetrics?.value && selectedMetrics.value.match(/time_to_publish/g)
      ? timeColumns
      : view === 'DAAC' ? daacTableColumns 
      : requestTableColumns;

  const tableColumnsFiltered = getTableColumns(selectedMetrics, view);

  const metricsWorkflow = data.map(item => ({
    ...item,
    workflow_name: workflows.find(workflow => workflow.id === item.workflow_id)?.long_name || "Unknown Workflow"
  }));

  const metricsWorkflows = { ...metrics.list, data: metricsWorkflow };

  return (
    <div className='page__component'>
      <section className='page__section page__section__controls'>
        <Breadcrumbs config={breadcrumbConfig} />
      </section>
      <section className='page__section page__section__header-wrapper'>
      {view !== 'DAAC' && <div className='page__section__header'>
          <h1 className='heading--large heading--shared-content with-description '>{strings.metric_overview}</h1>
        </div>}
        {view === 'DAAC' && <div className='page__section__header'>
          <h1 className='heading--large heading--shared-content with-description '>{strings.daacs_onboarded}</h1>
        </div>}
      </section>
      <section className='page__section'>
        {view === 'Overview' && <div className='heading__wrapper--border'>
          <h2 className='heading--medium heading--shared-content with-description'>{strings.all_metrics} <span className='num--title'>{metrics?.list?.data?.length}</span></h2>
        </div>}
        {view === 'User' && <div className='heading__wrapper--border'>
          <h2 className='heading--medium heading--shared-content with-description'>{strings.users} <span className='num--title'>{metrics?.list?.data?.[0]?.user_count}</span></h2>
        </div>}
        {view === 'DAAC' && <div className='heading__wrapper--border'>
          <h2 className='heading--medium heading--shared-content with-description'>{'Daacs onboarded'} <span className='num--title'>{filteredMetricsList.data?.length}</span></h2>
        </div>}

        {view !== 'User'?
        metrics?.list ?
          <List
          list={view === 'DAAC'? filteredMetricsList : metricsWorkflows}
          dispatch={dispatch}
          action={listCloudMetrics}
          tableColumns={tableColumnsFiltered}
          query={{}}
          bulkActions={[]}
          rowId='event'
        >
            <div className="filterGrid">
              {(view === 'Overview') && ( <label className='heading--small'>State
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
              /></label>)}
              {(view === 'Overview') && (<label className='heading--small'>Workflows
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
                /></label>)}
              {(view === 'Overview' || view === 'DAAC') && (<label className='heading--small'>Daacs
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
              /></label>)}

              {/* ADDED: date picker fields */}
              {(view === 'Overview' || view === 'DAAC') && (
                <label className='heading--small'>Start Date
                <div className='selectButton' >
                  <input
                    type="date"
                    value={startDate || ''}
                    onChange={(e) => setStartDate(e.target.value)}
                          style={{ width: '100%', border: 'none', height: '28px' }}

                  />
                </div>
                </label>
              )}
              {(view === 'Overview' || view === 'DAAC') && (
                <label className='heading--small'>End Date
                <div className='selectButton'>
                  <input
                    type="date"
                    value={endDate || ''}
                    onChange={(e) => setEndDate(e.target.value)}
                          style={{ width: '100%', border: 'none', height: '28px'}}

                  />
                </div>
                </label>
              )}
            </div>
        </List>
          : <Loading />:<div></div>}
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
  workflows: state.workflows.list.data,
  requests: state.requests,
  states: state.states,
  workflowOptions: workflowOptionNames(state),
  stateOptions: stateOptionNames(state),
  metricOptions: metricOptionNames(state),
  daacOptions: daacOptionNames(state),
}))(MetricOverview));
