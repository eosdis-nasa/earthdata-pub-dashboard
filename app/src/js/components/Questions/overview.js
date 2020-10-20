'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect, useDispatch } from 'react-redux';
import {
  getCount,
  searchQuestions,
  clearQuestionsSearch,
  filterQuestions,
  clearQuestionsFilter,
  listQuestions
} from '../../actions';
import { get } from 'object-path';
import { lastUpdated, tally, displayCase } from '../../utils/format';
import { tableColumns } from '../../utils/table-config/questions';
import List from '../Table/Table';
import Dropdown from '../DropDown/dropdown';
import Search from '../Search/search';
import Overview from '../Overview/overview';
import _config from '../../config';
import { strings } from '../locale';
import ListFilters from '../ListActions/ListFilters';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
import pageSizeOptions from '../../utils/page-size';

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
  constructor () {
    super();
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
    const { stats, questions, dispatch } = this.props;
    const { list } = questions;
    const { count, queriedAt } = list.meta;
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
