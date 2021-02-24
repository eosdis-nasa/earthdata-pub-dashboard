import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { get } from 'object-path';
import { connect } from 'react-redux';
import { withRouter, Redirect, Route, Switch } from 'react-router-dom';
import Sidebar from '../Sidebar/sidebar';
import {
  getCount,
  listSubmissions
} from '../../actions';
import { strings } from '../locale';
import AllSubmissions from './list';
import DatePickerHeader from '../DatePickerHeader/DatePickerHeader';
import SubmissionOverview from './request';
import SubmissionsOverview from './overview';
import EditMetadata from './edit-metadata';
import isEqual from 'lodash.isequal';

const withQueryWrapper = (Component, onQueryChange) => (props) => {
  return (
    <Component onQueryChange={onQueryChange} {...props} />
  );
};

const Requests = ({
  dispatch,
  location,
  params,
  stats
}) => {
  const { pathname } = location;
  const count = get(stats, 'count.data.requests.count');
  const AllSubmissionsWithWrapper = withQueryWrapper(AllSubmissions, onQueryChange);
  const [queryOptions, setQueryOptions] = useState({});

  function onQueryChange (newQueryOptions) {
    if (!isEqual(newQueryOptions, queryOptions)) {
      setQueryOptions(newQueryOptions);
    }
  }
  dispatch(listSubmissions());
  function query () {}
  return (
    <div className='page__submissions'>
      <DatePickerHeader onChange={query} heading={strings.all_submissions}/>
      <div className='page__content'>
        <div className='wrapper__sidebar'>
          <Sidebar
            currentPath={pathname}
            params={params}
            count={[count]}
          />
          <div className='page__content--shortened'>
            <Switch>
              <Route exact path='/requests' component={SubmissionsOverview} />
              <Route path='/requests/id/:requestId' component={SubmissionOverview} />
              <Route path='/requests/metadata/:requestId' component={EditMetadata} />
              <Route path='/requests/completed' component={AllSubmissionsWithWrapper} />
              <Route path='/requests/processing' component={AllSubmissionsWithWrapper} />
              <Route path='/requests/failed' component={AllSubmissionsWithWrapper} />
              <Redirect exact from='/requests/running' to='/requests/processing' />
            </Switch>
          </div>
        </div>
      </div>
    </div>
  );
};

Requests.propTypes = {
  location: PropTypes.object,
  params: PropTypes.object,
  dispatch: PropTypes.func,
  stats: PropTypes.object
};

export default withRouter(connect(state => ({
  stats: state.stats
}))(Requests));
