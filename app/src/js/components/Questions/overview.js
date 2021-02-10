'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import {
  getCount,
  // searchQuestions,
  // clearQuestionsSearch,
  // filterQuestions,
  // clearQuestionsFilter,
  listQuestions
} from '../../actions';
import { lastUpdated } from '../../utils/format';
import { tableColumns } from '../../utils/table-config/questions';
import List from '../Table/Table';
import { strings } from '../locale';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';

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
    const { list } = questions;
    const { queriedAt } = list.meta;
    return (
      <div className='page__component'>
        <section className='page__section page__section__controls'>
          <Breadcrumbs config={breadcrumbConfig} />
        </section>
        <section className='page__section page__section__header-wrapper'>
          <div className='page__section__header'>
            <h1 className='heading--large heading--shared-content with-description '>{strings.question_overview}</h1>
            {lastUpdated(queriedAt)}
          </div>
        </section>
        <section className='page__section page__section__controls'>
          <div className='heading__wrapper--border'>
            <h2 className='heading--medium heading--shared-content with-description'>{strings.all_questions} <span className='num--title'>{questions.list.data.length}</span></h2>
          </div>
          <List
            list={list}
            action={listQuestions}
            tableColumns={tableColumns}
            query={this.generateQuery()}
            rowId='id'
            sortIdx='long_name'
          >
          </List>
        </section>
      </div>
    );
  }
}

QuestionsOverview.propTypes = {
  questions: PropTypes.object,
  stats: PropTypes.object,
  dispatch: PropTypes.func,
  config: PropTypes.object
};

export { QuestionsOverview };

export default withRouter(connect(state => ({
  stats: state.stats,
  questions: state.questions,
  config: state.config
}))(QuestionsOverview));
