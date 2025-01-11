'use strict';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect, useDispatch } from 'react-redux';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
import queryString from 'query-string';
import UploadOverview from '../DataUpload/overview';
import { getUploadStep } from '../../actions';
import { Alert } from 'react-bootstrap';

const formatStepName = (stepName) => {
  return stepName.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};

const breadcrumbConfig = [
  {
    label: 'Dashboard Home',
    href: '/'
  },
  {
    label: 'Upload',
    active: true
  }
];

const UploadStep = ({ privileges, location }) => {
  const dispatch = useDispatch();
  const { uploadStepId } = queryString.parse(location.search);
  const [stepData, setStepData] = useState({});
  const [allowUpload, setAllowUpload] = useState(false);
  const [alertVariant, setAlertVariant] = useState('success');
  const [alertMessage, setAlertMessage] = useState('');
  const [dismissCountDown, setDismissCountDown] = useState(0);

  useEffect(() => {
    if (uploadStepId) {
      dispatch(getUploadStep(uploadStepId))
        .then(({ data }) => {
          if (data.error) {
            setAlertVariant('danger');
            setAlertMessage('Operation failed due to unexpected database error.');
            setDismissCountDown(10);
          } else {
            data.step_name = formatStepName(data.step_name);
            setStepData(data);
            setAllowUpload(true);
          }
        });
    }
  }, [dispatch, uploadStepId]);

  useEffect(() => {
    if (dismissCountDown > 0) {
      window.scrollTo(0, 0);
      const intervalId = setInterval(() => {
        setDismissCountDown((prevCount) => prevCount - 1);
      }, 1000);

      return () => clearInterval(intervalId);
    }
  }, [dismissCountDown]);

  return (
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
      { allowUpload
        ? <UploadOverview
          helpText= { stepData.help_text }
          uploadStepName = { stepData.step_name }
          uploadCategory = { stepData.category_type }
          uploadDestination = { stepData.upload_destination }
        />
        : null }
    </div>
  );
};

UploadStep.propTypes = {
  dispatch: PropTypes.func,
  config: PropTypes.object,
  privileges: PropTypes.object,
  match: PropTypes.object,
  location: PropTypes.object
};

export { UploadStep };

export default withRouter(connect(state => ({
  stats: state.stats,
  forms: state.forms,
  config: state.config,
  privileges: state.api.tokens.privileges
}))(UploadStep));
