import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { get } from 'object-path';
import { connect } from 'react-redux';
import { withRouter, Route, Switch } from 'react-router-dom';
import Sidebar from '../Sidebar/sidebar';
import { listSections } from '../../actions';
import SectionsOverview from './overview';
import EditSection from './edit';

const Sections = ({
  dispatch,
  location,
  params,
  stats
}) => {
  const { pathname } = location;
  const count = get(stats, 'count.data.questions.count');
  useEffect(() => {
    dispatch(listSections());
  }, []);
  

  return (
    <div className='page__questions'>
      <div className='content__header'>
        <div className='row'>
          <h1 className='heading--xlarge heading--shared-content'>Sections</h1>
        </div>
      </div>
      <div className='page__content'>
        <div className='wrapper__sidebar'>
          <Sidebar
            currentPath={pathname}
            params={params}
            count={[count]}
          />
          <div className='page__content--shortened'>
            <Switch>
              <Route exact path='/sections' component={SectionsOverview} />
              <Route path='/sections/edit/:id' component={EditSection} />
              <Route path='/sections/add' component={EditSection} />
            </Switch>
          </div>
        </div>
      </div>
    </div>
  );
};

Sections.propTypes = {
  location: PropTypes.object,
  params: PropTypes.object,
  dispatch: PropTypes.func,
  stats: PropTypes.object
};

export default withRouter(connect(state => ({
  stats: state.stats
}))(Sections));
