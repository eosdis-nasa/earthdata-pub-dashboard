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
import { get } from 'object-path';
import { tally, displayCase } from '../../utils/format';
import { tableColumns } from '../../utils/table-config/questions';
import List from '../Table/Table';
import Overview from '../Overview/overview';
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
    this.queryMeta = this.queryMeta.bind(this);
    this.state = {};
  }

  componentDidMount () {
  }

  componentWillUnmount () {
  }

  queryMeta () {
    const { dispatch } = this.props;
    dispatch(getCount({
      type: 'questions'
    }));
  }

  generateQuery () {
    return {};
  }

  render () {
    const { stats, questions } = this.props;
    const { list } = questions;
    const { count } = list.meta;
    const statsCount = get(stats, 'count.data.questions.count', []);
    const overviewItems = statsCount.map(d => [tally(d.count), displayCase(d.key)]);
    return (
      <div className='page__component'>
        <section className='page__section page__section__controls'>
          <Breadcrumbs config={breadcrumbConfig} />
        </section>
        <section className='page__section page__section__header-wrapper'>
          <div className='page__section__header'>
            <h1 className='heading--large heading--shared-content with-description '>{strings.questions_overview}</h1>
            <Overview items={overviewItems} inflight={false} />
          </div>
        </section>
        <section className='page__section'>
          <div className='heading__wrapper--border'>
            <h2 className='heading--medium heading--shared-content with-description'>{strings.all_questions} <span className='num--title'>{count ? ` ${tally(count)}` : 0}</span></h2>
          </div>
          <List
            list={list}
            action={listQuestions}
            tableColumns={tableColumns}
            query={this.generateQuery}
            rowId='question_id'
            sortIdx='question_name'
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
