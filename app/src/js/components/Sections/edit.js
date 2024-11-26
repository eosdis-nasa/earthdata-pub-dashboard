'use strict';
import React, { Component } from 'react';
import { Alert } from 'react-bootstrap';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import AceEditor from 'react-ace';
import {
  getSection,
  updateSection,
  addSection
} from '../../actions';
import Loading from '../LoadingIndicator/loading-indicator';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
import { formPrivileges } from '../../utils/privileges';

class Sections extends Component {
  constructor(props) {
    super(props);

    this.state = {
      formId: '',
      heading: '',
      daacId: '',
      listOrder: '',
      required_if: [],
      show_if: [],
      loading: false,
      alertMessage: '',
      alertVariant: 'success',
    };

    // Refs for AceEditor
    this.requiredIfRef = React.createRef();
    this.showIfRef = React.createRef();
  }

  componentDidMount() {
    const { dispatch, match } = this.props;
    const { id } = match.params;

    if (id) {
      this.setState({ loading: true });
      dispatch(getSection(id))
        .then(({ data }) => {
          this.setState({
            formId: data.form_id || '',
            heading: data.heading || '',
            daacId: data.daac_id || '',
            listOrder: data.list_order || '',
            required_if: data.required_if || [],
            show_if: data.show_if || [],
            loading: false,
          });
        })
        .catch(() => this.setState({ loading: false }));
    }
  }

  renderAceEditor(fieldName, ref) {
    const value = JSON.stringify(this.state[fieldName], null, '\t');
    return (
      <AceEditor
        mode="json"
        theme="github"
        name={`editor-${fieldName}`}
        value={value}
        width="auto"
        tabSize={2}
        showPrintMargin={false}
        minLines={2}
        maxLines={10}
        wrapEnabled={true}
        onChange={(value) => this.handleAceChange(fieldName, value)}
        ref={ref}
      />
    );
  }

  handleAceChange = (fieldName, value) => {
    try {
      const parsedValue = JSON.parse(value);
      this.setState({ [fieldName]: parsedValue });
    } catch (e) {
      console.error(`Invalid JSON in ${fieldName}:`, e);
    }
  };

  handleInputChange = (field, value) => {
    this.setState({ [field]: value });
  };

  inputsAreValid = () => {
    const { formId, heading, listOrder } = this.state;

    if (!this.props.match.params.id) {
      // Validation only for new section creation
      if (!formId.trim() || !heading.trim() || !listOrder.trim() || isNaN(listOrder)) {
        this.setState({
          alertVariant: 'danger',
          alertMessage: 'Form ID, Heading and List Order(must be an integer) are required.',
        });
        return false;
      }
    }
    return true;
  };

   stringifyFields = (data, fields) =>
    fields.reduce((acc, field) => {
      const value = data[field];
      if (Array.isArray(value) || typeof value === 'object') {
        acc[field] = value; 
      } else if (value) {
        acc[field] = JSON.stringify(value); 
      }
      return acc;
    }, {});
  
  

    handleSubmit = async () => {
      const { canCreate, canEdit } = formPrivileges(this.props.privileges);
      if (!this.inputsAreValid()) return;
    
      const { dispatch, match, history } = this.props;
      const { id } = match.params;
      const { formId, heading, daacId, listOrder, required_if, show_if } = this.state;
    
      const payload = {
        form_id: formId,
        heading,
        daac_id: daacId,
        list_order: parseInt(listOrder, 10), // Ensure it's an integer
        ...this.stringifyFields({ required_if, show_if }, ['required_if', 'show_if']),
      };
    
      try {
        const response = id
          ? canEdit && await dispatch(updateSection(payload, id)) // Editing
          : canCreate && await dispatch(addSection(payload)); // Adding
    
        this.setState({
          alertVariant: 'success',
          alertMessage: 'Section saved successfully!',
        });
        history.push('/sections');
      } catch (error) {
        console.error('Failed to save section:', error);
        this.setState({
          alertVariant: 'danger',
          alertMessage: 'Failed to save section.',
        });
      }
    };
    

  render() {
    const {
      formId,
      heading,
      daacId,
      listOrder,
      alertMessage,
      alertVariant,
      loading,
    } = this.state;

    const breadcrumbConfig = [
      { label: 'Dashboard Home', href: '/' },
      { label: 'Sections', href: '/sections' },
      { label: this.props.match.params.id ? 'Edit Section' : 'Add Section', active: true },
    ];

    const { canCreate, canEdit } = formPrivileges(this.props.privileges);
    const hasPrivilege = this.props.match.params.id ? canEdit : canCreate;

    if (!hasPrivilege) {
      return (
        <div className="unauthorized">
          <h1>Unauthorized</h1>
          <p>You do not have the required privileges to {this.props.match.params.id ? 'edit this section' : 'create a new section'}.</p>
        </div>
      );
    }

    return (
      <div className="page__content">
        <div className="page__component">
          <section className="page__section page__section__controls">
            <Breadcrumbs config={breadcrumbConfig} />
          </section>
          <Alert
            show={alertMessage.length > 0}
            variant={alertVariant}
            dismissible
            onClose={() => this.setState({ alertMessage: '' })}
          >
            {alertMessage}
          </Alert>
          <section className="page__section page__section__header-wrapper">
            <div className="page__section__header">
              <h1 className="heading--large heading--shared-content with-description">
                {this.props.match.params.id ? 'Edit Section' : 'Add Section'}
              </h1>
            </div>
          </section>
          {loading ? (
            <Loading />
          ) : (
            <div className="page__content">
              <section className="page__section page__section__controls user-section">
                <div className="heading__wrapper--border">
                  <h2 className="heading--medium heading--shared-content with-description">
                    Section Fields
                  </h2>
                </div>
                <label className="heading--small" htmlFor="form_id">
                  Form Id
                </label>
                <input
                  type="text"
                  id="form_id"
                  name="form_id"
                  value={formId}
                  onChange={(e) => this.handleInputChange('formId', e.target.value)}
                  style={{ width: '250px' }}
                />
                <label className="heading--small" htmlFor="heading">
                  Heading
                </label>
                <input
                  type="text"
                  id="heading"
                  name="heading"
                  value={heading}
                  onChange={(e) => this.handleInputChange('heading', e.target.value)}
                />
                <label className="heading--small" htmlFor="daac_id">
                  DAAC Id
                </label>
                <input
                  type="text"
                  id="daac_id"
                  name="daac_id"
                  value={daacId}
                  onChange={(e) => this.handleInputChange('daacId', e.target.value)}
                  style={{ width: '250px' }}
                />
                <label className="heading--small" htmlFor="list_order">
                  List Order
                </label>
                <input
                  type="text"
                  id="list_order"
                  name="list_order"
                  value={listOrder}
                  onChange={(e) => this.handleInputChange('listOrder', e.target.value)}
                  style={{ width: '225px' }}
                  placeholder="Enter an integer"
                />
                <label className="heading--small">Required If</label>
                {this.renderAceEditor('required_if', this.requiredIfRef)}
                <label className="heading--small">Show If</label>
                {this.renderAceEditor('show_if', this.showIfRef)}
              </section>
              <section className="page__section">
                <Link
                    className={'button button--cancel button__animation--md button__arrow button__arrow--md button__animation button--secondary'}
                    to={'/sections'}
                    id='cancelButton'
                    aria-label="cancel form editing"
                  >
                  Cancel
                </Link>
                {(canCreate || canEdit) && (
                  <button
                    className="button button--submit"
                    onClick={this.handleSubmit}
                    aria-label="Submit Section"
                  >
                    Submit
                  </button>
                )}
              </section>
            </div>
          )}
        </div>
      </div>
    );
  }
}

Sections.propTypes = {
  match: PropTypes.object,
  dispatch: PropTypes.func,
  history: PropTypes.object,
  privileges: PropTypes.object
};

export default withRouter(
  connect((state) => ({
    sections: state.sections,
    privileges: state.api.tokens.privileges
  }))(Sections)
);
