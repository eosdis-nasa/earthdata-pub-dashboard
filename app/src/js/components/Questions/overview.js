'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { listQuestions } from '../../actions';
import { lastUpdated } from '../../utils/format';
import { questionPrivileges } from '../../utils/privileges';
import { tableColumns } from '../../utils/table-config/questions';
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
    label: 'Questions',
    active: true
  }
];

class QuestionsOverview extends React.Component {
  constructor (props) {
    super(props);
    this.generateQuery = this.generateQuery.bind(this);
    this.state = {};
  }

  componentDidMount () {
  }

  componentWillUnmount () {
  }

  generateQuery () {
    return {};
  }

  render () {
    const { questions } = this.props;
    let { list } = questions;
    const { canCreate, canEdit, canDelete } = questionPrivileges(this.props.privileges);
    if ((questions && questions.list.data.constructor.name !== 'Array') || (!canCreate || !canEdit || !canDelete)) {
      list = { data: [], meta: '', count: 0 };
    }
    const query = this.generateQuery();
    const { queriedAt } = list.meta;
    return (
      <div className='page__component questions-overview'>
        <section className='page__section page__section__controls'>
          <Breadcrumbs config={breadcrumbConfig} />
        </section>
        <section className='page__section page__section__header-wrapper'>
          <div className='page__section__header'>
            <h1 className='heading--large heading--shared-content with-description '>{strings.question_overview}</h1>
            {list.meta ? lastUpdated(queriedAt) : null}
          </div>
        </section>
        <section className='page__section page__section__controls'>
          <div className='heading__wrapper--border' style={{ height: '3rem' }}>
            <h2 className='heading--medium heading--shared-content with-description'>{strings.all_questions} <span className='num--title'>{(questions.list.data.length > 0) ? questions.list.data.length : 0}</span></h2>
            {canCreate
              ? <Link
                className='button button--small button--green button--add-small form-group__element--right new-request-button' to={{ pathname: '/questions/add' }}
            >Add Question
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
                action={listQuestions}
                tableColumns={tableColumns}
                query={query}
                rowId='id'
                filterIdx='question_name'
                filterPlaceholder='Search Questions'
              >
              </List>
          }
          </div>
        </section>
      </div>
    );
  }
}

QuestionsOverview.propTypes = {
  questions: PropTypes.object,
  stats: PropTypes.object,
  dispatch: PropTypes.func,
  config: PropTypes.object,
  privileges: PropTypes.object
};

export { QuestionsOverview };

export default withRouter(connect(state => ({
  stats: state.stats,
  questions: state.questions,
  config: state.config,
  privileges: state.api.tokens.privileges
}))(QuestionsOverview));
