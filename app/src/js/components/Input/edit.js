'use strict';
import React from 'react';
import AceEditor from 'react-ace';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import {
  getInput,
  createInput,
  updateInput
} from '../../actions';
import config from '../../config';
import Loading from '../LoadingIndicator/loading-indicator';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
import ErrorReport from '../Errors/report';
import { formPrivilegesCU } from '../../utils/privileges';

class Questions extends React.Component {
  constructor () {
    super();
    this.state = { view: 'json', data: '', section_data: '' };
    this.refName = React.createRef();
    this.sectionRefName = React.createRef();
    this.renderQuestionJson = this.renderQuestionJson.bind(this);
    this.renderJson = this.renderJson.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  async componentDidMount () {
    const { inputId, controlId } = this.props.match.params;
    await this.props.dispatch(getInput(inputId, controlId))
  }

  renderQuestionJson (name, data, refName) {
    return (
            <AceEditor
                mode='json'
                theme={config.editorTheme}
                name={`edit-${name}`}
                value={JSON.stringify(data, null, '\t')}
                width='auto'
                tabSize={config.tabSize}
                showPrintMargin={false}
                minLines={2}
                maxLines={35}
                wrapEnabled={true}
                ref={refName}
            />
    );
  }

  async handleSubmit () {
    const { dispatch } = this.props;
    const { inputId, controlId } = this.props.match.params;
    const inputAceEditorData = JSON.parse(this.refName.current.editor.getValue());

    this.setState({ data: inputAceEditorData });

    const stringifyFields = (fields) =>
      Object.fromEntries(fields.map((field) => [field, JSON.stringify(inputAceEditorData[field])]));

    const formattedPayload = {
      ...inputAceEditorData,
      edit_control_id: inputAceEditorData.control_id !== controlId? controlId: inputAceEditorData.control_id ,
      ...stringifyFields(['enums', 'attributes', 'required_if', 'show_if'])
    };

    if (inputAceEditorData && Object.keys(inputAceEditorData).length !== 0) {
      const result = await dispatch(inputId ? updateInput(formattedPayload) : createInput(formattedPayload));
      if(!result?.statusCode) this.props.history.push(`/inputs/edit/${inputAceEditorData?.question_id}/${formattedPayload?.control_id}`);
      if(inputId) this.props.history.push('/inputs');
    }    
  }

  getRandom () {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  render () {
    const { inputId } = this.props.match.params;

    const record = (inputId ? this.props.questions.detail : { data: {} });
    const { canCreate, canEdit } = formPrivilegesCU(this.props.privileges);
    const breadcrumbConfig = [
      {
        label: 'Dashboard Home',
        href: '/'
      },
      {
        label: 'Inputs',
        href: '/inputs'
      },
      {
        label: inputId || 'Add Input',
        active: true
      }
    ];
    console.log('record',record)
    return (
            <div className='page__component'>
                <section className='page__section page__section__controls'>
                    <Breadcrumbs config={breadcrumbConfig} />
                </section>
                <h1 className='heading--large heading--shared-content with-description'>
                    {record.data ? (record.data.control_id ?  'Edit Input' : 'Add Input') : '...'}
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
                                                onClick={() => this.state.view !== 'json' && this.setState({ view: 'json' })}>Input JSON</button>
                                    </div>
                                    <div>
                                        {this.renderJson((this.state.data ? this.state.data : record.data), this.refName)}
                                    </div>
                                </div>
                          : null
                    }
                    
                </section>
                {(canEdit && canCreate)
                  ? <section className='page__section'>
                  <Link className={'button button--cancel button__animation--md button__arrow button__arrow--md button__animation button--secondary'}
                  to={'/input'} id='cancelButton' aria-label="cancel question editing">
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

  renderJson (data, refName) {
    return (
            <ul>
                <li>
                    <label>{data.name}
                    {this.renderQuestionJson(`recipe_${this.getRandom()}`, data, refName)}</label>
                </li>
            </ul>
    );
  }
}

Questions.propTypes = {
  match: PropTypes.object,
  questions: PropTypes.object,
  dispatch: PropTypes.func,
  history: PropTypes.object,
  privileges: PropTypes.object
};

export default withRouter(connect(state => ({
  privileges: state.api.tokens.privileges,
  questions: state.questions
}))(Questions));
