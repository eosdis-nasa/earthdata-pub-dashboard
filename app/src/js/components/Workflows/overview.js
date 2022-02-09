'use strict';
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';
import { connect, useDispatch } from 'react-redux';
import {
  // getCount,
  // searchWorkflows,
  // clearWorkflowsSearch,
  // filterWorkflows,
  // clearWorkflowsFilter,
  applyWorkflowToRequest,
  listWorkflows
} from '../../actions';
import { lastUpdated, shortDateNoTimeYearFirst } from '../../utils/format';
import List from '../Table/Table';
import { strings } from '../locale';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';

const breadcrumbConfig = [
  {
    label: 'Dashboard Home',
    href: '/'
  },
  {
    label: 'Workflows',
    active: true
  }
];

const WorkflowsOverview = ({ workflows, location }) => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(listWorkflows());
  }, [workflows.searchString, dispatch]);
  const requestId = location.search.split('=')[1];

  const makeSteps = (row) => {
    try {
      return Object.keys(row.steps).join(', ');
    } catch (error) {
      return '';
    }
  };

  const checkUncheckOthers = (id) => {
    const radios = document.getElementsByTagName('input');
    for (let i = 0; i < radios.length; i++) {
      const regex = new RegExp(`select_${id}`, 'g');
      if (radios[i].type === 'radio') {
        if (radios[i].id.match(regex)) {
          continue;
        }
        radios[i].checked = false;
      }
    }
  };

  function setWorkflow (requestId) {
    const radios = document.getElementsByTagName('input');
    for (let i = 0; i < radios.length; i++) {
      if (radios[i].type === 'radio' && radios[i].checked) {
        const workflow = radios[i].id;
        if (typeof workflow !== 'undefined' && (workflow.split('_').length - 1)) {
          const workflowChosen = workflow.split('_')[1];
          applyWorkflowToRequest(requestId, workflowChosen);
          console.log('workflow ' + workflowChosen + ' should have been applied to request ' + requestId);
          break;
        }
      }
    }
  }

  const selectInput = [{
    Header: 'Select',
    accessor: (row) => row.long_name,
    Cell: row => <input type="radio" className={ 'form__element__clickable' }
      onClick={(e) => { checkUncheckOthers(row.row.original.id); }} id={`select_${row.row.original.id}`}>{row.long_name}</input>,
    id: 'select',
    width: 50
  }];

  const defaultTableColumns = [
    {
      Header: 'Name',
      accessor: (row) => row.long_name,
      Cell: row => <Link to={{ pathname: `/workflows/id/${row.row.original.id}` }}>{row.row.original.long_name}</Link>,
      id: 'long_name'
    },
    {
      Header: 'Version',
      accessor: (row) => row.version,
      id: 'version',
      width: 70
    },
    {
      Header: 'Description',
      accessor: (row) => row.description,
      id: 'description'
    },
    {
      Header: 'Steps',
      accessor: makeSteps,
      id: 'steps'
    },
    {
      Header: 'Created At',
      accessor: row => shortDateNoTimeYearFirst(row.created_at),
      id: 'created_at'
    }
  ];

  let tableColumns = [];
  if (typeof requestId !== 'undefined') {
    tableColumns = selectInput.concat(defaultTableColumns);
    const selectTr = document.getElementsByClassName('table__sort')[0];
    // This makes the select column header appear unclickable (although it is)
    // Theres a better way, come back to this later
    if (typeof selectTr !== 'undefined') {
      selectTr.classList.remove('table__sort');
      selectTr.removeAttribute('style');
    }
  } else {
    tableColumns = defaultTableColumns;
  }

  const { queriedAt } = workflows.list.meta;
  const disabled = !workflows.list.data.length;
  return (
    <div className='page__component'>
      <section className='page__section page__section__controls'>
        <Breadcrumbs config={breadcrumbConfig} />
      </section>
      <section className='page__section page__section__header-wrapper'>
        <div className='page__section__header'>
          <h1 className='heading--large heading--shared-content with-description '>{strings.workflow_overview}</h1>
          {lastUpdated(queriedAt)}
        </div>
      </section>
      <section className='page__section'>
        <div className='heading__wrapper--border'>
          <h2 className='heading--medium heading--shared-content with-description'>{strings.all_workflows} <span className='num--title'>{workflows.list.data.length}</span></h2>
        </div>
        <List
          list={workflows.list}
          dispatch={dispatch}
          action={listWorkflows}
          tableColumns={tableColumns}
          query={{}}
          bulkActions={[]}
          rowId='id'
          filterIdx='long_name'
          filterPlaceholder='Search Workflows'
        >
        </List>
          { requestId
            ? <section className='page__section' style={{ float: 'right' }}>
                <button onClick={(e) => { e.preventDefault(); setWorkflow(requestId); }}
                className={'button button--small button--green form-group__element--left button--no-icon' + (disabled ? ' button--disabled' : '')}>
                  Select
                </button>
              </section>
            : null }
      </section>
    </div>
  );
};

WorkflowsOverview.propTypes = {
  workflows: PropTypes.object,
  stats: PropTypes.object,
  dispatch: PropTypes.func,
  config: PropTypes.object,
  match: PropTypes.object,
  requests: PropTypes.object,
  history: PropTypes.object,
  privileges: PropTypes.object,
  location: PropTypes.object,
};

export { WorkflowsOverview };

export default withRouter(connect(state => ({
  stats: state.stats,
  workflows: state.workflows,
  config: state.config,
  match: state.match,
  requests: state.requests,
  history: state.history
}))(WorkflowsOverview));
