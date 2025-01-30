'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { listSteps } from '../../actions';
import { lastUpdated } from '../../utils/format';
import { userPrivileges } from '../../utils/privileges';
import { tableColumns } from '../../utils/table-config/steps';
import List from '../Table/Table';
import { strings } from '../locale';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
import Loading from '../LoadingIndicator/loading-indicator';

const breadcrumbConfig = [
  {
    label: 'Dashboard Home',
    href: '/'
  },
  {
    label: 'Steps',
    active: true
  }
];

class StepsOverview extends React.Component {
  constructor (props) {
    super(props);
    this.generateQuery = this.generateQuery.bind(this);
    this.state = {};
  }

  generateQuery () {
    return {};
  }

  render () {
    const { steps } = this.props;
    let { list } = steps;
    const { canUpdateWorkflow } = userPrivileges(this.props.privileges);
    if ((steps && steps.list.data.constructor.name !== 'Array') || !canUpdateWorkflow) {
      list = { data: [], meta: '', count: 0 };
    }
    const query = this.generateQuery();
    const { queriedAt } = list.meta;
    return (
      <div className='page__component steps-overview'>
        <section className='page__section page__section__controls'>
          <Breadcrumbs config={breadcrumbConfig} />
        </section>
        <section className='page__section page__section__header-wrapper'>
          <div className='page__section__header'>
            <h1 className='heading--large heading--shared-content with-description '>{strings.step_overview}</h1>
            {list.meta ? lastUpdated(queriedAt) : null}
          </div>
        </section>
        <section className='page__section page__section__controls'>
          <div className='heading__wrapper--border' style={{ height: '3rem' }}>
            <h2 className='heading--medium heading--shared-content with-description'>{strings.all_steps} <span className='num--title'>{(steps.list.data.length > 0) ? steps.list.data.length : 0}</span></h2>
            {canUpdateWorkflow
              ? <Link
                className='button button--small button--green button--add-small form-group__element--right new-request-button' to={{ pathname: '/steps/add' }}
            >Add Step
            </Link>
              : null}
          </div>
        </section>
        <section className='page__section page__section__controls'>
          <div>
          {!list
            ? <Loading />
            : <List
                list={list}
                action={listSteps}
                tableColumns={tableColumns}
                query={query}
                rowId='id'
                filterIdx='step_name'
                filterPlaceholder='Search Steps'
              >
              </List>
          }
          </div>
        </section>
      </div>
    );
  }
}

StepsOverview.propTypes = {
  steps: PropTypes.object,
  stats: PropTypes.object,
  dispatch: PropTypes.func,
  config: PropTypes.object,
  privileges: PropTypes.object
};

export { StepsOverview };

export default withRouter(connect(state => ({
  stats: state.stats,
  steps: state.steps,
  config: state.config,
  privileges: state.api.tokens.privileges
}))(StepsOverview));
