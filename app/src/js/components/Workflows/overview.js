'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import {
  listWorkflows,
  applyWorkflowToRequest
} from '../../actions';
import { Button, Modal } from 'react-bootstrap';
import { lastUpdated, shortDateNoTimeYearFirst } from '../../utils/format';
import List from '../Table/Table';
import { strings } from '../locale';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
import { requestPrivileges, formPrivileges } from '../../utils/privileges';
import { listRequests } from '../../actions';

class WorkflowsOverview extends React.Component {
  constructor () {
    super();
    this.state = {
      showConfirmPopup: false,
      selectedWorkflow: null,
      workflowCounts: {},
      selectedWorkflowCount: 0
    };
    this.setWorkflow = this.setWorkflow.bind(this);
    this.cancelWorkflow = this.cancelWorkflow.bind(this);
    this.openConfirmPopup = this.openConfirmPopup.bind(this);
    this.closeConfirmPopup = this.closeConfirmPopup.bind(this);
    this.proceedToEdit = this.proceedToEdit.bind(this);
    //this.calculateWorkflowCounts = this.calculateWorkflowCounts(this);

  }

  async componentDidMount () {
    const { dispatch } = this.props;
    await dispatch(listRequests())
    dispatch(listWorkflows());
    this.setState({ workflowCounts: this.calculateWorkflowCounts(this.props.requests.list.data || [])});
  }

  makeSteps (row) {
    try {
      return Object.keys(row.steps).join(', ');
    } catch (error) {
      return '';
    }
  }

  openConfirmPopup(workflow) {
    const name = workflow.long_name;
    const count = this.state.workflowCounts[name] || 0;
    this.setState({
      showConfirmPopup: true,
      selectedWorkflow: workflow,
      selectedWorkflowCount: count
    });
  }  
  
  closeConfirmPopup() {
    this.setState({ showConfirmPopup: false, editWorkflowId: null });
  }
  
  proceedToEdit() {
    const { selectedWorkflow } = this.state;
    this.setState({ showConfirmPopup: false, selectedWorkflow: null }, () => {
      this.props.history.push(`/workflows/edit/${selectedWorkflow.id}`);
    });
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
          await window.location.reload(false);
        }
      }
    }
  }

  cancelWorkflow () {
    this.props.location.search = '';
    this.props.history.goBack();
  }

  calculateWorkflowCounts (data) {
    const counts = {};
    data.forEach(item => {
      if (item.workflow_name) {
        counts[item.workflow_name] = (counts[item.workflow_name] || 0) + 1;
      }
    });
    return counts;
  };
  
  render () {
    const { dispatch } = this.props;
    const workflows = this.props.workflows;
    const requestId = location.search.split('=')[1];
    const self = this;

    if (workflows && !Array.isArray(workflows.list.data)) {
      window.location.reload(true);
    }
    const { roles } = this.props;
    const role = roles ? Object.keys(roles).map(role => roles[role].short_name) : [];
    let isEditable = false;
    if (role.includes('admin')) {
      isEditable = true;
    }
    let { canReassign } = requestPrivileges(this.props.privileges);
    if (role.includes('manager') || role.includes('admin') || role.includes('staff') || canReassign) {
      canReassign = true;
    }
    const selectInput = [{
      Header: 'Select',
      accessor: (row) => row.long_name,
      Cell: row => <input type="radio" className={ `form__element__clickable select_${row.row.original.short_name}` } aria-label={ 'select workflow' }
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

    if (typeof requestId === 'undefined' && isEditable) {
      defaultTableColumns.push({
        Header: 'Options',
        accessor: '',
        Cell: ({ row }) => (
          <button
            className="button button--small button--edit"
            onClick={() => self.openConfirmPopup(row.original)}
            aria-label="Edit your workflow"
          >
            Edit
          </button>
        ),        
        id: 'required'
      });      
    }

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
    const { canRead } = formPrivileges(this.props.privileges);

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
          {workflows && typeof requestId === 'undefined' && isEditable
            ? <Link
              className='button button--small button--green button--add-small form-group__element--right new-request-button' to={{ pathname: '/workflows/add' }}
            >Add Workflow
          </Link>
            : null}
          <div className='heading__wrapper--border'>
            <h2 className='heading--medium heading--shared-content with-description'>{strings.all_workflows} <span className='num--title'>{workflows.list.data.length}</span></h2>
          </div>
        </section>
        <section className='page__section'>
          <div>
            {canRead && <List
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
            </List>}
          </div>
          { requestId && canReassign
            ? <section className='page__section'>
              <button
                className={'button button--cancel button__animation--md button__arrow button__arrow--md button__animation button--secondary'}
                id="cancelButton"
                onClick={(e) => { e.preventDefault(); this.cancelWorkflow(); }}
              >Cancel</button>
              <Link className={'button button--submit button__animation--md button__arrow button__arrow--md button__animation button__arrow--white' + (disabled ? ' button--disabled' : '')}
                    onClick={this.setWorkflow} id={'selectButton'} to={'/requests'}
                    aria-label="select workflow">
                Select
              </Link>
            </section>
            : null }
        </section>
        <Modal show={this.state.showConfirmPopup} onHide={this.closeConfirmPopup} className="custom-modal">
        <Modal.Header closeButton>
          <Modal.Title>Confirm Edit Workflow</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {this.state.selectedWorkflowCount > 0 && <>There are currently <strong>{this.state.selectedWorkflowCount}</strong> requests using the <strong>{this.state.selectedWorkflow?.long_name || 'No Name Available'}</strong> and will be affected by this update. Do you wish to continue?</>}
          {this.state.selectedWorkflowCount === 0 && <p>Are you sure you want to edit <strong>{this.state.selectedWorkflow?.long_name || 'No Name Available'}</strong>?</p>}                 
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={this.closeConfirmPopup}>
            NO
          </Button>
          <Button variant="primary" onClick={this.proceedToEdit}>
            YES
          </Button>
        </Modal.Footer>
      </Modal>
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
  roles: PropTypes.array,
  requests: PropTypes.object
};

export { WorkflowsOverview };

export default withRouter(connect(state => ({
  stats: state.stats,
  workflows: state.workflows,
  dispatch: state.dispatch,
  config: state.config,
  privileges: state.api.tokens.privileges,
  roles: state.api.tokens.roles,
  requests: state.requests
}))(WorkflowsOverview));
