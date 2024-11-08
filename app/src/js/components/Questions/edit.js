'use strict';
import React, { useEffect, useState } from 'react';
import { Alert } from 'react-bootstrap';
import AceEditor from 'react-ace';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter, Link, useHistory } from 'react-router-dom';
import {
  getQuestion,
  updateQuestion,
  addQuestion,
  updateInputs,
  listDaacs,
  listQuestions
} from '../../actions';
import config from '../../config';
import Loading from '../LoadingIndicator/loading-indicator';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
import { questionPrivileges } from '../../utils/privileges';
import Select from 'react-select';

const Questions = ({ dispatch, match, questions, privileges }) => {
  const { questionId } = match.params;
  const requireIfRefName = React.createRef();
  const showIfRefName = React.createRef();

  const history = useHistory();
  const [alertVariant, setAlertVariant] = useState('success');
  const [alertMessage, setAlertMessage] = useState('');
  const [dismissCountDown, setDismissCountDown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [daacs, setDaacs] = useState([]);
  const [daacOptions, setDaacOptions] = useState([]);
  const [selectedDaacs, setSelectedDaacs] = useState([]);
  const [questionDaacList, setQuestionDaacList] = useState([]);
  const [id, setId] = useState('');
  const [short_name, setShortName] = useState('');
  const [version, setVersion] = useState('');
  const [validVersion, setValidVersion] = useState(true);
  const [long_name, setLongName] = useState('');
  const [text, setText] = useState('');
  const [help, setHelp] = useState('');
  const [created_at, setCreatedAt] = useState('');
  const [required, setRequired] = useState(false);
  const [section_id, setSectionId] = useState('');
  const [list_order, setListOrder] = useState('');
  const [validListOrder, setValidListOrder] = useState(true);
  const [missingReq, setMissingReq] = useState(false);

  useEffect(() => {
    setLoading(true);
    dispatch(listDaacs())
      .then((data) => {
        setDaacs(data.data);
        
        if (questionId) {
          dispatch(getQuestion(questionId))
          .then(({ data }) => {
            loadQuestionData(data);
            setLoading(false);
          });
        } else {
          setLoading(false);
        }

      })
      .catch((err) => {
        setLoading(false);
      });

  }, [])

  useEffect(() => {
    dispatch(listQuestions());
  }, [questions.detail]);

useEffect(() => {
  const db_daacs = [];
  daacs.forEach((d) => {
    if (questionDaacList.includes(d.id)){
      db_daacs.push({ value: d.id, label: d.short_name });
    }
  });
  setSelectedDaacs(db_daacs);

}, [questionDaacList])

useEffect(() => {
  setDaacOptions(daacs.map(({ id, short_name }) => ({ value: id, label: short_name })));
}, [daacs]);

useEffect(() => {
  const requiredCheckbox = document.getElementById('required')
  if (requiredCheckbox.checked != required){
    requiredCheckbox.checked = required;
  }
}, [required]);

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
    label: questionId || 'Add Question',
    active: true
  }
];

const loadQuestionData = (editData) => {
  setId(editData.id);
  setShortName(editData.short_name);
  setVersion(editData.version);
  setLongName(editData.long_name);
  setText(editData.text);
  setHelp(editData.help);
  setRequired(editData.required);
  setQuestionDaacList(editData.daac_ids);
} 

const extractId = (list) => {
  const rtnList = [];
  list.forEach(item => {
    rtnList.push(item.value);
  });
  return rtnList;
};

const handleDaacSelect = (data) => {
  setSelectedDaacs(data);
};


const inputsAreValid = () => {
  let isValid = false;

  if ((short_name && validVersion && long_name)) {
    if (!questionId) {
      if (section_id && validListOrder) {
        isValid = true;
      } 
    } else {
      isValid = true;
    }

  }   

  if (!isValid) {
    validVersion ? null : setVersion('');
    validListOrder ? null : setListOrder('');
  }

  setMissingReq(!isValid);

  return isValid;

};

  const validateNumberInput = (input, setFunction, validFunction) => {
    setFunction(input);
    validFunction(input.match(/^\d+$/));
  };

  const handleSubmit = async () => {
    if (inputsAreValid()) {
      const payload = {
        short_name: short_name,
        version: version,
        long_name: long_name,
        text: text,
        help: help,
        required: required,
        created_at: created_at      
      };

      // Handle fields w/ defaults
      id === '' ? null : payload.id = id;
      
      if (selectedDaacs.length > 0) {
        payload.daac_ids = extractId(selectedDaacs);
      }

      // If this is an update operation set the created_at time
      if (questionId) {
        const current_time = new Date();
        payload.created_at = current_time.toISOString()
      }

      //Add Section Question information
      if (!questionId) {
          const sectionQuestion = {
            section_id: section_id,
            list_order: list_order,
          } 

          const require_if_aceEditorData = JSON.parse(requireIfRefName.current.editor.getValue());
          const show_if_aceEditorData = JSON.parse(showIfRefName.current.editor.getValue());

          require_if_aceEditorData.length > 0 ? sectionQuestion.required_if = require_if_aceEditorData : null;
          show_if_aceEditorData.length > 0 ? sectionQuestion.show_if = show_if_aceEditorData : null;

          payload.section_question = sectionQuestion;
      }
      
      const response =  questionId ? await dispatch(updateQuestion(payload)) : await dispatch(addQuestion(payload));

      if (response.data?.statusCode == 503){
        setAlertVariant('danger');
        setAlertMessage('Operation failed due to unexpected database error.');
        setDismissCountDown(10);

      } else {
        history.push(`/questions/id/${response.data.id}`);
      }
    }
  };

  const getRandom = () => {
      return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

  const renderQuestionJson =  (name, data, refName) => {
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
  };

  const renderJson  = (data, refName) =>  {
    return (
        <ul>
            <li>
                <label>{data.name}
                {renderQuestionJson(`recipe_${getRandom()}`, data, refName)}</label>
            </li>
        </ul>
    );
  }

  const errorCheck = (failCondition) => {
    const borderColor = (!failCondition || failCondition === '') && missingReq ? '#DB1400' : '';
    return borderColor;
  };
  const { canCreate, canEdit, canDelete } = questionPrivileges(privileges);
  return (
    <div className='page__content'>
      <div className='page__component'>
        <section className='page__section page__section__controls'>
          <Breadcrumbs config={breadcrumbConfig} />
        </section>
        <Alert
          className="sticky-alert"
          show={dismissCountDown > 0}
          variant={alertVariant}
          dismissible
          onClose={() => setDismissCountDown(0)}
        >
          {alertMessage}
        </Alert>
        <section className='page__section page__section__header-wrapper'>
          <div className='page__section__header'>
            <h1 className='heading--large heading--shared-content with-description '>
              {questionId ? 'Edit Question': 'Add Question'}
            </h1>
          </div>
        </section>
        <div className='page__content'>
          { loading ? <Loading /> : null }
          <section className='page__section page__section__controls user-section'>
          <div className='heading__wrapper--border'>
            <h2 className='heading--medium heading--shared-content with-description'>Question Fields</h2>
          </div>
            <label className='heading--small' htmlFor="id">Question Id</label>
            <input type="text" id="id" name="id" value={id} onChange={e => setId(e.target.value)} 
              disabled={questionId ? true : false}/>
            <label className='heading--small' htmlFor="short_name">Short Name</label>
            <input type="text" id="short_name" name="short_name" value={short_name} onChange={e => setShortName(e.target.value)}
              style={{ borderColor: errorCheck(short_name) }} />
            <label className='heading--small' htmlFor="version">Version</label>
            {/* <input type="text" id="version" name="version" value={version} onChange={e => setVersion(e.target.value)} */}
            <input type="text" id="version" name="version" value={version} onChange={e => validateNumberInput(e.target.value, setVersion, setValidVersion)}
              style={{ borderColor: errorCheck(version) }} />
            <label className='heading--small' htmlFor="long_name">Long Name</label>
            <input type="text" id="long_name" name="long_name" value={long_name} onChange={e => setLongName(e.target.value)}
              style={{ borderColor: errorCheck(long_name) }} />
            <label className='heading--small' htmlFor="text">Text</label>
            <input type="text" id="text" name="text" value={text} onChange={e => setText(e.target.value)}/>
            <label className='heading--small' htmlFor="help">Help</label>
            <input type="text" id="help" name="help" value={help} onChange={e => setHelp(e.target.value)}/>
            <label className='heading--small' htmlFor="help">Required</label>
            <input type="checkbox" id="required" name="required" value={help} onChange={e => setRequired(e.target.checked)} />
            <label className='heading--small'>Daac Ids
                <Select
                  id="daacSelect"
                  options={daacOptions}
                  value={selectedDaacs}
                  onChange={handleDaacSelect}
                  isSearchable={true}
                  isMulti={true}
                  className='selectButton'
                  placeholder='Select DAACS ...'
                  aria-label='Select DAACS'
                /></label>
          </section>
          { questionId ? null :
              <section className='page__section page__section__controls user-section'>
                <div className='heading__wrapper--border'>
                  <h2 className='heading--medium heading--shared-content with-description'>Section Question Fields</h2>
                </div>
                <label className='heading--small' htmlFor="section_id">Section Id</label>
                {/* TODO update this to a dropdown if we create a getSections endpoint to list all sections*/}
                <input type="text" id="section_id" name="section_id" value={section_id} onChange={e => setSectionId(e.target.value)}
                  style={{ borderColor: errorCheck(section_id) }} />
                <label className='heading--small' htmlFor="list_order">List Order</label>
                <input type="text" id="list_order" name="list_order" value={list_order} onChange={e => validateNumberInput(e.target.value, setListOrder, setValidListOrder)}
                  style={{ borderColor: errorCheck(list_order) }} />
                <label className='heading--small' htmlFor="required_if">Required If</label>
                <div id="required_if">
                  {renderJson(([]), requireIfRefName)}
                </div>
                <label className='heading--small' htmlFor="show_if">Show If</label>
                <div id="show_if">
                  {renderJson(([]), showIfRefName)}
                </div>
              </section>
          }
          
        {(canDelete && canEdit && canCreate)
          ? <section className='page__section'>
          <Link className={'button button--cancel button__animation--md button__arrow button__arrow--md button__animation button--secondary'}
          to={'/questions'} id='cancelButton' aria-label="cancel question editing">
              Cancel
          </Link>
          <button className={'button button--submit button__animation--md button__arrow button__arrow--md button__animation button__arrow--white'}
          onClick={handleSubmit} aria-label="submit your questions">
              Submit
          </button>
        </section>
          : null}
        </div>
      </div>
    </div>
  );
};

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
