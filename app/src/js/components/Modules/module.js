'use strict';
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect, useDispatch } from 'react-redux';
import { getModuleUi } from '../../actions';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';

const iframeRef = React.createRef();
const pageRef = React.createRef();

const Module = ({ dispatch, modules, match }) => {
  const { moduleName } = match.params;
  const current = modules.list.mapped[moduleName];
  const breadcrumbConfig = [
    {
      label: 'Dashboard Home',
      href: '/'
    },
    {
      label: 'Modules',
      href: '/modules'
    },
    {
      label: current.long_name || '',
      active: true
    }
  ];
  useEffect(() => {
    dispatch(getModuleUi(moduleName));
    iframeRef.current.height = pageRef.current.offsetHeight;
    iframeRef.current.width = '100%';
  }, []);
  return (
    <div ref={pageRef} className='page__content--shortened'>
      <div className='page__component'>
        <section className='page__section page__section__controls'>
          <Breadcrumbs config={breadcrumbConfig} />
        </section>
        <section className='page__section'>
          <iframe
            ref={iframeRef}
            srcDoc={modules.module.src}
            sandbox="allow-scripts allow-same-origin"
          >

          </iframe>
        </section>
      </div>
    </div>
  );
};

Module.propTypes = {
  dispatch: PropTypes.func,
  modules: PropTypes.object,
  match: PropTypes.object
};

export default withRouter(connect(
  (state) => ({ modules: state.modules })
)(Module));
