import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'object-path';
import { connect } from 'react-redux';
import { withRouter, Route, Switch } from 'react-router-dom';
import Sidebar from '../Sidebar/sidebar';
import { listInputs } from '../../actions';
import InputsOverview from './overview';
import EditInput from './edit';

const Inputs = ({
  dispatch,
  location,
  params,
  stats
}) => {
  const { pathname } = location;
  const count = get(stats, 'count.data.questions.count');
  dispatch(listInputs());

  return (
    <div className='page__questions'>
      <div className='content__header'>
        <div className='row'>
          <h1 className='heading--xlarge heading--shared-content'>Inputs</h1>
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
              <Route exact path='/inputs' component={InputsOverview} />
              <Route path='/inputs/edit/:inputId/:controlId' component={EditInput} />
              <Route path='/inputs/add' component={EditInput} />
            </Switch>
          </div>
        </div>
      </div>
    </div>
  );
};

Inputs.propTypes = {
  location: PropTypes.object,
  params: PropTypes.object,
  dispatch: PropTypes.func,
  stats: PropTypes.object
};

export default withRouter(connect(state => ({
  stats: state.stats
}))(Inputs));
