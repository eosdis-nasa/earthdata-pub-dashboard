'use strict';
import React from 'react';
import Ace from 'react-ace';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { getRole } from '../../actions';
import config from '../../config';
import { setWindowEditorRef } from '../../utils/browser';
import Loading from '../LoadingIndicator/loading-indicator';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
import ErrorReport from '../Errors/report';

class Roles extends React.Component {
  constructor () {
    super();
    this.state = { view: 'json' };
    this.renderReadOnlyJson = this.renderReadOnlyJson.bind(this);
    this.renderJson = this.renderJson.bind(this);
  }

  componentDidMount () {
    const { dispatch } = this.props;
    const { roleId } = this.props.match.params;
    dispatch(getRole(roleId));
  }

  renderReadOnlyJson (name, data) {
    return (
      <Ace
        mode='json'
        theme={config.editorTheme}
        name={`read-only-${name}`}
        readOnly={true}
        value={JSON.stringify(data, null, '\t')}
        width='auto'
        tabSize={config.tabSize}
        showPrintMargin={false}
        minLines={1}
        maxLines={35}
        wrapEnabled={true}
        ref={setWindowEditorRef}
      />
    );
  }

  render () {
    const { roleId } = this.props.match.params;
    const record = this.props.roles.detail;
    const breadcrumbConfig = [
      {
        label: 'Dashboard Home',
        href: '/'
      },
      {
        label: 'Roles',
        href: '/roles'
      },
      {
        label: roleId,
        active: true
      }
    ];

    return (
      <div className='page__component'>
        <section className='page__section page__section__controls'>
          <Breadcrumbs config={breadcrumbConfig} />
        </section>
        <h1 className='heading--large heading--shared-content with-description'>
          {record.data ? record.data.long_name : '...'}
        </h1>
        <section className='page__section'>
          { record.inflight
            ? <Loading />
            : record.error
              ? <ErrorReport report={record.error} />
              : record.data
                ? <div>
                  <div className='tab--wrapper'>
                    <button className={'button--tab ' + (this.state.view === 'json' ? 'button--active' : '')}
                      onClick={() => this.state.view !== 'json' && this.setState({ view: 'json' })}>JSON View</button>
                  </div>
                  <div>
                    {this.state.view === 'list' ? this.renderList(record.data) : this.renderJson(record.data)}
                  </div>
                </div>
                : null
          }
        </section>
      </div>
    );
  }

  renderJson (data) {
    return (
      <ul>
        <li>
          <label>{data.long_name}
          {this.renderReadOnlyJson('recipe', data)}</label>
        </li>
      </ul>
    );
  }
}

Roles.propTypes = {
  match: PropTypes.object,
  roles: PropTypes.object,
  dispatch: PropTypes.func
};

export default withRouter(connect(state => ({
  roles: state.roles
}))(Roles));
