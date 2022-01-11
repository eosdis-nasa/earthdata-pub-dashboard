'use strict';
import React from 'react';
import Ace from 'react-ace';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
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
        this.state = { view: 'json', data: '' } ;
        this.refName = React.createRef();
        this.renderQuestionJson = this.renderQuestionJson.bind(this);
        this.renderJson = this.renderJson.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
    }

    componentDidMount () {
        const { dispatch } = this.props;
        const { questionId } = this.props.match.params;
        dispatch(getQuestion(questionId))
    }

    renderQuestionJson (name, data) {
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
                ref={this.refName}
            />
        );
    }

    handleSubmit() {
        const { dispatch } = this.props;
        let aceEditorData = JSON.parse(this.refName.current.editor.getValue())
        this.setState({ data: aceEditorData } );
        dispatch(updateQuestion(aceEditorData));
        window.location.href=`/questions/id/${aceEditorData.id}`;
    }

    handleCancel() {
        window.location.href='/questions';
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
                                                onClick={() => this.state.view !== 'json' && this.setState({ view: 'json' })}>JSON View</button>
                                    </div>
                                    <div>
                                        {this.renderJson(this.state.data ? this.state.data: record.data)}
                                    </div>
                                </div> : null
                    }
                    <button
                        className={`button button--submit button__animation--md button__arrow button__arrow--md button__animation button__arrow--white form-group__element--right`}
                        onClick={this.handleSubmit}
                    >Submit</button>
                    <button
                        className='button button--cancel button__animation--md button__arrow button__arrow--md button__animation button--secondary form-group__element--right'
                        onClick={this.handleCancel}
                    >Cancel</button>
                </section>
            </div>
        );
    }

    renderJson (data) {
        return (
            <ul>
                <li>
                    <label>{data.name}</label>
                    {this.renderQuestionJson('recipe', data)}
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
