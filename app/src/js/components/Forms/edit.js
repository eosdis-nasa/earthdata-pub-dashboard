'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import {
  listRoles,
  listGroups,
  getFormDetails,
  addForm,
  updateForm
} from '../../actions';
import _config from '../../config';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
const { basepath } = _config;
const urlReturn = `${basepath}forms`;

class EditForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      longname: '',
      shortname: '',
      originalShortname: '',
      description: '',
      version: '',
      daac_only: false, // Initialize daac_only for the checkbox
      originalVersion: '',
      errors: {}
    };
  }

  handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    this.setState({
      [name]: type === 'checkbox' ? checked : value,
      errors: { ...this.state.errors, [name]: '' }
    });
  };

  validateForm = () => {
    const { longname, shortname, description, version } = this.state;
    const errors = {};

    if (!longname) errors.longname = 'Long Name is required';
    if (!shortname) errors.shortname = 'Short Name is required';
    if (!description) errors.description = 'Description is required';
    if (!version) errors.version = 'Version is required';

    this.setState({ errors });
    return Object.keys(errors).length === 0;
  };

  handleSubmit = async () => {
    const { id } = this.props.match.params;

    if (!this.validateForm()) return;

    const { shortname, description, version, longname, daac_only, originalShortname, originalVersion } = this.state;
    const { dispatch } = this.props;
    const formData = {
      short_name: shortname,
      long_name: longname,
      description,
      version: Number(version),
      daac_only,
      original_shortname: originalShortname,
      original_version: originalVersion
    };
    if (id) {
      await dispatch(updateForm(formData));
    } else {
      await dispatch(addForm(formData));
    }
    window.location.href = urlReturn;
  };

  async componentDidMount() {
    const { dispatch } = this.props;
    const { id } = this.props.match.params;

    const result = await dispatch(getFormDetails(id));
    const record = result && result.data;
    if (record) {
      this.setState({
        longname: record.long_name || '',
        shortname: record.short_name || '',
        originalShortname: record.short_name || '',
        description: record.description || '',
        version: record.version || '',
        daac_only: record.daac_only || false,
        originalVersion: record.version || ''
      });
    }
  }

  render() {
    const { id } = this.props.match.params;
    const { longname, shortname, originalShortname, description, version, daac_only, originalVersion, errors } = this.state;

    const breadcrumbConfig = [
      {
        label: 'Dashboard Home',
        href: '/index'
      },
      {
        label: 'Forms',
        href: '/forms'
      },
      {
        label: id ? id : 'Add Form',
        active: true
      }
    ];

    return (
      <div className='page__content'>
        <div className='page__component'>
          <section className='page__section page__section__controls'>
            <Breadcrumbs config={breadcrumbConfig} />
          </section>
          <section className='page__section page__section__header-wrapper'>
            <div className='page__section__header'>
              <h1 className='heading--large heading--shared-content with-description '>
                Form Overview
              </h1>
            </div>
          </section>
          <div className='page__content'>
            <section className='page__section page__section__controls user-section'>
              <div className='heading__wrapper--border'>
                <h2 className='heading--medium heading--shared-content with-description'>{id ? 'Edit Form' : 'Add Form'}</h2>
              </div>

              <label className='heading--small' htmlFor="longname">Long Name</label>
              <input
                type="text"
                id="longname"
                name="longname"
                value={longname}
                onChange={this.handleChange}
                placeholder={errors.longname ? errors.longname : 'Enter long name'}
                className={errors.longname ? 'input-error-form' : ''}
              />
              
              <label className='heading--small' htmlFor="shortname">Short Name</label>
              <input
                type="text"
                id="shortname"
                name="shortname"
                value={shortname}
                onChange={this.handleChange}
                placeholder={errors.shortname ? errors.shortname : 'Enter short name'}
                className={errors.shortname ? 'input-error-form' : ''}
              />
    
              <label className='heading--small' htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={description}
                onChange={this.handleChange}
                placeholder={errors.description ? errors.description : 'Enter description'}
                className={errors.description ? 'input-error-form' : ''}
              />
              
              <label className='heading--small' htmlFor="version">Version</label>
              <input
                type="number"
                id="version"
                name="version"
                value={version}
                onChange={this.handleChange}
                placeholder={errors.version ? errors.version : 'Enter version number'}
                className={errors.version ? 'input-error-form' : ''}
              />

              <div style={{ display: 'flex' }}>
                <label className='heading--small' htmlFor="daac_only" style={{ marginRight: '10px' }}>DAAC Only</label>
                <input
                  type="checkbox"
                  id="daac_only"
                  name="daac_only"
                  checked={daac_only}
                  style={{ cursor: 'pointer',  transform: 'scale(1.5)', marginTop: '5px' }}
                  onChange={this.handleChange}
                  className={errors.daac_only ? 'input-error-form' : ''}
                />
              </div>

            </section>
            <section className='page__section'>
              <Link
                className={'button button--cancel button__animation--md button__arrow button__arrow--md button__animation button--secondary'}
                to={'/forms'}
                id='cancelButton'
                aria-label="cancel form editing"
              >
                Cancel
              </Link>
              <button
                className={'button button--submit button__animation--md button__arrow button__arrow--md button__animation button__arrow--white'}
                onClick={this.handleSubmit}
                aria-label="submit your form"
              >
                Submit
              </button>
            </section>
          </div>
        </div>
      </div>
    );
  }
}

EditForm.propTypes = {
  match: PropTypes.object,
  forms: PropTypes.object,
  dispatch: PropTypes.func
};

export default withRouter(connect(state => ({
  forms: state.forms
}))(EditForm));
