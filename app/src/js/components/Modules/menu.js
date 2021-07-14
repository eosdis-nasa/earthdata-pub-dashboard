'use strict';
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';

const breadcrumbConfig = [
  {
    label: 'Dashboard Home',
    href: '/'
  },
  {
    label: 'Modules',
    active: true
  }
];

const ModulesMenu = ({ dispatch, modules }) => {
  return (
    <div className='page__content--shortened'>
      <div className='page__component'>
        <section className='page__section page__section__controls'>
          <Breadcrumbs config={breadcrumbConfig} />
        </section>
        <section className='page__section'>
          <div className='heading__wrapper--border'>
            <h2 className='heading--medium heading--shared-content with-description'>Modules <span className='num--title'>{modules.list.data.length}</span></h2>
          </div>
          <div>
            <ul>
            { modules.list.data.map(module => (
              <li key={module.id}>
                <Link to={`/modules/${module.short_name}`}>
                  {module.long_name}
                </Link>
              </li>
            )) }
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
};

ModulesMenu.propTypes = {
  dispatch: PropTypes.func,
  modules: PropTypes.object
};

export default withRouter(connect(
  (state) => ({ modules: state.modules })
)(ModulesMenu));
