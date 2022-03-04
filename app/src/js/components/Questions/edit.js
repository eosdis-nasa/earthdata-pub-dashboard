'use strict';
import React from 'react';
import Ace from 'react-ace';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import {
    getQuestion,
    updateQuestion
} from '../../actions';
import config from '../../config';
import Loading from '../LoadingIndicator/loading-indicator';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
import ErrorReport from '../Errors/report';

class Questions extends React.Component {
    constructor () {
        super();
        this.state = { view: 'json', data: '' , section_data: ''} ;
        this.refName = React.createRef();
        this.sectionRefName = React.createRef();
        this.renderQuestionJson = this.renderQuestionJson.bind(this);
        this.renderJson = this.renderJson.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        // this.handleCancel = this.handleCancel.bind(this);
    }

    componentDidMount () {
        const { dispatch } = this.props;
        const { questionId } = this.props.match.params;
        questionId ? dispatch(getQuestion(questionId)) : null
    }

    renderQuestionJson (name, data, refName) {
        return (
            <Ace
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

    async handleSubmit() {
        const { dispatch } = this.props;
        let question_aceEditorData = JSON.parse(this.refName.current.editor.getValue());
        let section_question_aceEditorData = this.sectionRefName.current ? JSON.parse(this.sectionRefName.current.editor.getValue()) : {};
        this.setState({ data: question_aceEditorData, section_data: section_question_aceEditorData } );
        await dispatch(updateQuestion(Object.assign({}, question_aceEditorData,
            {section_question: section_question_aceEditorData})))
        // window.location.href=`/questions/id/${question_aceEditorData.id}`;
    }

    render () {
        const { questionId } = this.props.match.params;
        const record = (questionId ? this.props.questions.detail : {data: {}});
        const breadcrumbConfig = [
            {
                label: 'Dashboard Home',
                href: '/'
            },
            {
                label: 'Questions',
                href: '/questions'
            },
            {
                label: questionId,
                active: true
            }
        ];

        return (
            <div className='page__component'>
                <section className='page__section page__section__controls'>
                    <Breadcrumbs config={breadcrumbConfig} />
                </section>
                <h1 className='heading--large heading--shared-content with-description'>
                    {record.data ? (record.data.long_name ? record.data.long_name : 'Add Question') : '...'}
                </h1>
                <section className='page__section'>
                    { record.inflight ? <Loading />
                        : record.error ? <ErrorReport report={record.error} />
                            : record.data
                                ? <div>
                                    <div className='tab--wrapper'>
                                        <button className={'button--tab ' + (this.state.view === 'json' ? 'button--active' : '')}
                                                onClick={() => this.state.view !== 'json' && this.setState({ view: 'json' })}>Question JSON</button>
                                    </div>
                                    <div>
                                        {this.renderJson((this.state.data ? this.state.data: record.data), this.refName)}
                                    </div>
                                </div> : null
                    }
                    { questionId ? null : (record.inflight ? <Loading />
                        : record.error ? <ErrorReport report={record.error} />
                            : record.data
                                ? <div>
                                    <div className='tab--wrapper'>
                                        <button className={'button--tab ' + (this.state.view === 'json' ? 'button--active' : '')}
                                                onClick={() => this.state.view !== 'json' && this.setState({ view: 'json' })}>Section-Question JSON</button>
                                    </div>
                                    <div>
                                        {this.renderJson((this.state.section_data ? this.state.section_data : record.data), this.sectionRefName)}
                                    </div>
                                </div> : null)
                    }
                    {/*TODO- Update this redirect to `/questions/id/${this.state.data.id}` once we no longer rely on user to define question id*/}
                    <Link className={`button button--submit button__animation--md button__arrow button__arrow--md button__animation button__arrow--white form-group__element--right`}
                    onClick={this.handleSubmit} to={`/questions`}>
                        Submit
                    </Link>
                    <Link className={'button button--cancel button__animation--md button__arrow button__arrow--md button__animation button--secondary form-group__element--right'}
                    to={`/questions`}>
                        Cancel
                    </Link>
                    {/*<button*/}
                    {/*    className={`button button--submit button__animation--md button__arrow button__arrow--md button__animation button__arrow--white form-group__element--right`}*/}
                    {/*    onClick={this.handleSubmit}*/}
                    {/*>Submit</button>*/}
                    {/*<button*/}
                    {/*    className='button button--cancel button__animation--md button__arrow button__arrow--md button__animation button--secondary form-group__element--right'*/}
                    {/*    onClick={this.handleCancel}*/}
                    {/*>Cancel</button>*/}
                </section>
            </div>
        );
    }

    renderJson (data, refName) {
        return (
            <ul>
                <li>
                    <label>{data.name}</label>
                    {this.renderQuestionJson('recipe', data, refName)}
                </li>
            </ul>
        );
    }
}

Questions.propTypes = {
    match: PropTypes.object,
    questions: PropTypes.object,
    dispatch: PropTypes.func,
    history: PropTypes.object
};

export default withRouter(connect(state => ({
    questions: state.questions
}))(Questions));
