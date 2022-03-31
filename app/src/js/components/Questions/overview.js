'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { listQuestions } from '../../actions';
import { lastUpdated } from '../../utils/format';
import { tableColumns } from '../../utils/table-config/questions';
import List from '../Table/Table';
import { strings } from '../locale';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
import {Link} from "react-router-dom";
import Loading from "../LoadingIndicator/loading-indicator";

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
          <div style={{padding: '1em'}}>
            <Link
                className='button button--green' style={{float: 'right', padding: '.65em'}}
                to={{ pathname: `/questions/add` }}
            >Add Question
            </Link>
          </div>
          {!questions.list || questions.list.data.constructor.name !== 'Array' ? <Loading /> : <List
                list={list}
                action={listQuestions}
                tableColumns={tableColumns}
                query={this.generateQuery()}
                rowId='id'
                filterIdx='question_name'
                filterPlaceholder='Search Questions'
              >
              </List>
          }
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
