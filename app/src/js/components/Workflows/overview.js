'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import {
  listWorkflows,
  applyWorkflowToRequest
} from '../../actions';
import { lastUpdated, shortDateNoTimeYearFirst } from '../../utils/format';
import List from '../Table/Table';
import { strings } from '../locale';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
import { requestPrivileges } from '../../utils/privileges';

class WorkflowsOverview extends React.Component {
  constructor () {
    super();
    this.state = {};
    this.setWorkflow = this.setWorkflow.bind(this);
    this.cancelWorkflow = this.cancelWorkflow.bind(this);
  }

  componentDidMount () {
    const { dispatch } = this.props;
    dispatch(listWorkflows());
  }

  makeSteps (row) {
    try {
      return Object.keys(row.steps).join(', ');
    } catch (error) {
      return '';
    }
  }

  getAnySelected () {
    const radios = document.getElementsByTagName('input');
    for (let i = 0; i < radios.length; i++) {
      if (radios[i].type === 'radio') {
        if (radios[i].checked) {
          return true;
        }
      }
    }
    return false;
  }

  checkUncheckOthers (id) {
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
    if (this.getAnySelected()) {
      const el = document.getElementById('selectButton');
      el.classList.remove('button--disabled');
    }
  }

  async setWorkflow () {
    const { dispatch } = this.props;
    const requestId = location.search.split('=')[1];
    const radios = document.getElementsByTagName('input');
    for (let i = 0; i < radios.length; i++) {
      if (radios[i].type === 'radio' && radios[i].checked) {
        const workflow = radios[i].id;
        if (typeof workflow !== 'undefined' && (workflow.split('_').length - 1)) {
          const workflowChosen = workflow.split('_')[1];
          await dispatch(applyWorkflowToRequest(requestId, workflowChosen));
        }
      }
    }
  }

  cancelWorkflow () {
    this.props.location.search = '';
    this.props.history.goBack();
  }

  render () {
    const { dispatch } = this.props;
    const workflows = this.props.workflows;
    const requestId = location.search.split('=')[1];

    const selectInput = [{
      Header: 'Select',
      accessor: (row) => row.long_name,
      Cell: row => <input type="radio" className={ 'form__element__clickable' } aria-label={ 'select workflow' }
        onClick={(e) => { this.checkUncheckOthers(row.row.original.id); }} id={`select_${row.row.original.id}`} >{row.long_name}</input>,
      id: 'select',
      width: 50
    }];

    const defaultTableColumns = [
      {
        Header: 'Name',
        accessor: (row) => row.long_name,
        Cell: row => <Link to={{ pathname: `/workflows/id/${row.row.original.id}` }} aria-label="View your workflows">{row.row.original.long_name}</Link>,
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
        accessor: this.makeSteps,
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
    const breadcrumbConfig = [
      {
        label: 'Dashboard Home',
        href: '/'
      }
    ];
    if (typeof requestId !== 'undefined') {
      breadcrumbConfig.push({
        label: 'Requests',
        href: '/requests'
      });
      breadcrumbConfig.push({
        label: requestId,
        href: `/requests/id/${requestId}`
      });
      breadcrumbConfig.push({
        label: 'Workflows',
        active: true
      });
    } else {
      breadcrumbConfig.push({
        label: 'Workflows',
        active: true
      });
    }
    const { queriedAt } = workflows.list.meta;
    const disabled = !workflows.list.data.length || !this.getAnySelected();
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
                <Link className={'button button--submit button__animation--md button__arrow button__arrow--md button__animation button__arrow--white form-group__element--right' + (disabled ? ' button--disabled' : '')}
                      onClick={this.setWorkflow} id={"selectButton"} to={`/requests`}
                      aria-label="select workflow">
                  Select
                </Link>
                <button
                  className={'button button--cancel button__animation--md button__arrow button__arrow--md button__animation button--secondary form-group__element--right'}
                  id="cancelButton"
                  onClick={(e) => { e.preventDefault(); this.cancelWorkflow(); }}
                >Cancel</button>
              </section>
            : null }
        </section>
      </div>
    );
  }
}

WorkflowsOverview.propTypes = {
  workflows: PropTypes.object,
  stats: PropTypes.object,
  dispatch: PropTypes.func,
  location: PropTypes.object,
  config: PropTypes.object,
  privileges: PropTypes.object,
  history: PropTypes.object,
  roles: PropTypes.array
};

export { WorkflowsOverview };

export default withRouter(connect(state => ({
  stats: state.stats,
  workflows: state.workflows,
  dispatch: state.dispatch,
  config: state.config,
  privileges: state.api.tokens.privileges,
  roles: state.api.tokens.roles,
}))(WorkflowsOverview));
