import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter, Redirect, Route, Switch } from 'react-router-dom';
import Sidebar from '../Sidebar/sidebar';
import { strings } from '../locale';
import AllRequests from './list';
import DatePickerHeader from '../DatePickerHeader/DatePickerHeader';
import RequestOverview from './request';
import RequestsOverview from './overview';
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
  const AllSubmissionsWithWrapper = withQueryWrapper(AllRequests, onQueryChange);
  const [queryOptions, setQueryOptions] = useState({});

  function onQueryChange (newQueryOptions) {
    if (!isEqual(newQueryOptions, queryOptions)) {
      setQueryOptions(newQueryOptions);
    }
  }

  function query () {
    // dispatch(getCount({
    //   type: 'requests'
    // }));
  }
  return (
    <div className='page__requests'>
      <DatePickerHeader onChange={query} heading={strings.all_submissions}/>
      <div className='page__content'>
        <div className='wrapper__sidebar'>
          <Sidebar
            currentPath={pathname}
            params={params}
          />
          <div className='page__content--shortened'>
            <Switch>
              <Route exact path='/requests' component={RequestsOverview} />
              <Route exact path='/requests/id/:requestId' component={RequestOverview} />
              <Route path='/requests/id/:requestId/edit-metadata' component={EditMetadata} />
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
