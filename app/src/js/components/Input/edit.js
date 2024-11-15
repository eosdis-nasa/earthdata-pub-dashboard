import React from 'react';
import AceEditor from 'react-ace';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import { getInput, createInput, updateInput } from '../../actions';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
import { formPrivilegesCU } from '../../utils/privileges';

class Questions extends React.Component {
  constructor() {
    super();
    this.state = {
      data: {
        question_id: '',
        control_id: '',
        list_order: 0,
        label: '',
        type: '',
        required: false,
        enums: [],
        attributes: {},
        required_if: [],
        show_if: [],
      },
      originalData: { // Store old values
        question_id: '',
        control_id: ''
      }
    };
    

    this.enumsRef = React.createRef();
    this.attributesRef = React.createRef();
    this.requiredIfRef = React.createRef();
    this.showIfRef = React.createRef();

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleAceChange = this.handleAceChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  async componentDidMount() {
    const { inputId, controlId } = this.props.match.params;
    if (inputId) {
      const result = await this.props.dispatch(getInput(inputId, controlId));
      if (result?.data) {
        this.setState({
          data: result.data,
          originalData: { // Store the original values
            question_id: result.data.question_id,
            control_id: result.data.control_id
          }
        });
      }
    }
  }
  

  handleInputChange(event) {
    const { name, value, type, checked } = event.target;
    this.setState((prevState) => ({
      data: {
        ...prevState.data,
        [name]: type === 'checkbox' ? checked : value,
      },
    }));
  }

  handleAceChange(refName, value) {
    try {
      // Prevent clearing the field if the value is empty (during paste)
      if (value.trim() === '') {
        console.warn(`Empty value detected for ${refName}, ignoring change.`);
        return;
      }
  
      let parsedValue;
  
      if (typeof value === 'string') {
        try {
          parsedValue = JSON.parse(value);
        } catch (parseError) {
          return; 
        }
      } else if (Array.isArray(value)) {
        parsedValue = value; 
      } else {
        throw new Error('Input must be a JSON string or an array.');
      }
  
      // Validate enums specifically
      if (refName === 'enums') {
        if (!Array.isArray(parsedValue)) {
          throw new Error('Enums must be an array.');
        }
  
        const isValidArray = parsedValue.every(
          (item) =>
            typeof item === 'string' ||
            (typeof item === 'object' &&
              item !== null &&
              'key' in item &&
              'type' in item &&
              'label' in item &&
              'editable' in item)
        );
  
        if (!isValidArray) {
          throw new Error(
            'Enums must be an array of strings or valid objects with keys: key, type, label, editable.'
          );
        }
      }
  
      // Update state with validated value
      this.setState((prevState) => ({
        data: {
          ...prevState.data,
          [refName]: parsedValue,
        },
      }));
    } catch (error) {
      console.error(`Error updating ${refName}:`, error.message);
      alert(`Invalid input for ${refName}: ${error.message}`);
    }
  }

  async handleSubmit() {
    const { dispatch } = this.props;
    const { inputId } = this.props.match.params;
    const { data, originalData } = this.state;
  
    const stringifyFields = (fields) =>
      fields.reduce((acc, field) => {
        if (data[field]) {
          acc[field] = JSON.stringify(data[field]);
        }
        return acc;
      }, {});
  
    // Stringify required fields
    const stringifiedFields = stringifyFields(['enums', 'attributes', 'required_if', 'show_if']);
  
    // Create the payload
    const payload = {
      ...data,
      ...stringifiedFields, 
      old_question_id: originalData.question_id,
      old_control_id: originalData.control_id,
    };
  
    // Update or create input
    const result = await dispatch(inputId ? updateInput(payload) : createInput(payload));
    if (result?.data?.question_id) {
      this.props.history.push('/inputs');
    } else {
      alert('Error in Input Create/Edit. Check console for details.');
      console.error('Error in Input Create/Edit:', result);
    }
  }
  
  

  renderAceEditor(fieldName, ref) {
    const value = JSON.stringify(this.state.data[fieldName], null, '\t');
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
  

  render() {
    const { data } = this.state;
    const { inputId } = this.props.match.params;
    const { canCreate, canEdit } = formPrivilegesCU(this.props.privileges);

    const breadcrumbConfig = [
      { label: 'Dashboard Home', href: '/' },
      { label: 'Inputs', href: '/inputs' },
      { label: inputId ? 'Edit Input' : 'Add Input', active: true },
    ];
                  
    return (
      <div className="page__component">
        <section className="page__section page__section__controls">
          <Breadcrumbs config={breadcrumbConfig} />
        </section>
        <div className='heading__wrapper--border'>
          <h2 className='heading--medium heading--shared-content with-description'>{inputId ? 'Edit Input' : 'Add Input'}</h2>
        </div>

        <section className="page__section page__section__controls user-section">
          <div>  
            <label className='heading--small' htmlFor="questionid" >Question ID</label>
            <input
              type="text"
              name="question_id"
              value={data.question_id}
              onChange={this.handleInputChange}
              style={{ width: '250px' }} 
            />
          </div>
          <div>
            <label className='heading--small'>Control ID</label>
            <input
              type="text"
              name="control_id"
              value={data.control_id}
              onChange={this.handleInputChange}
            />
          </div>
          <div >
            <label className='heading--small'>List Order</label>
            <input
              type="number"
              name="list_order"
              value={data.list_order}
              onChange={this.handleInputChange}
            />
          </div>
          <div>
            <label className='heading--small'>Label</label>
            <input
              type="text"
              name="label"
              value={data.label}
              onChange={this.handleInputChange}
            />
          </div>
          <div>
            <label className='heading--small'>Type</label>
            <input
              type="text"
              name="type"
              value={data.type}
              onChange={this.handleInputChange}
            />
          </div>
          <div>
            <label className='heading--small'>
              Required
              <input
                type="checkbox"
                name="required"
                checked={data.required}
                onChange={this.handleInputChange}
              />
            </label>
          </div>

          <div>
            <label className='heading--small'>Enums</label>
            {this.renderAceEditor('enums', this.enumsRef)}
          </div>
          <div>
            <label className='heading--small'>Attributes</label>
            {this.renderAceEditor('attributes', this.attributesRef)}
          </div>
          <div>
            <label className='heading--small'>Required If</label>
            {this.renderAceEditor('required_if', this.requiredIfRef)}
          </div>
          <div>
            <label className='heading--small'>Show If</label>
            {this.renderAceEditor('show_if', this.showIfRef)}
          </div>
        </section>

        {(canEdit && canCreate)
          ? <section className='page__section'>
          <Link className={'button button--cancel button__animation--md button__arrow button__arrow--md button__animation button--secondary'}
          to={'/inputs'} id='cancelButton' aria-label="cancel question editing">
              Cancel
          </Link>
          <button className={'button button--submit button__animation--md button__arrow button__arrow--md button__animation button__arrow--white'}
          onClick={this.handleSubmit} aria-label="submit your questions">
              Submit
          </button>
        </section>
          : null}
      </div>
    );
  }
}

Questions.propTypes = {
  match: PropTypes.object,
  questions: PropTypes.object,
  dispatch: PropTypes.func,
  history: PropTypes.object,
  privileges: PropTypes.object,
};

export default withRouter(
  connect((state) => ({
    privileges: state.api.tokens.privileges,
    questions: state.questions,
  }))(Questions)
);
