import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withRouter, useParams } from 'react-router-dom';
import { connect, useDispatch } from 'react-redux';
import { listDaacs, assignDaacs, getRequest } from '../../actions';
import { Form, FormGroup, FormLabel, Button, Table } from 'react-bootstrap';
import _config from '../../config';
import { strings } from '../locale';
import { Alert } from 'react-bootstrap';

const FormsOverview = ({ forms, requests }) => {
  const { requestId } = useParams(); 
  const [daacs, setDaacs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [selectedDaacs, setSelectedDaacs] = useState({});
  const [requiresReview, setRequiresReview] = useState(null);
  const [alertVariant, setAlertVariant] = useState('success');
  const [alertMessage, setAlertMessage] = useState('');
  const [dismissCountDown, setDismissCountDown] = useState(0);

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(listDaacs())
      .then((data) => {
        setDaacs(data.data);
        if (requestId){
          dispatch(getRequest(requestId))
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [dispatch, requestId]);

  useEffect(() => {
    if (requests.detail.data?.assigned_daacs){
      const assignedDaacs = requests.detail.data.assigned_daacs.map((entry) => entry.daac_id);
      setSelected(assignedDaacs);
    }
  }, [dispatch, requests]);

  useEffect(() => {
      if (dismissCountDown > 0) {
        const intervalId = setInterval(() => {
          setDismissCountDown((prevCount) => prevCount - 1);
        }, 1000);
  
        return () => clearInterval(intervalId);
      }
    }, [dismissCountDown]);

  const setSelectedValues = (url, id, short_name, long_name, description) => {
    let selectedDaacCopy = { ...selectedDaacs };
    let selectedCopy;
    if (selected.includes(id)) {
      selectedCopy = selected.filter((daacId) => id !== daacId);
      delete selectedDaacCopy[id];

    } else {
      selectedCopy = [...selected, id];
      selectedDaacCopy[id] = { url, id, short_name, long_name, description }
    }
    
    setSelectedDaacs(selectedDaacCopy);
    setSelected(selectedCopy);
  };

  const showAlert = (message, variant, dissmissTimer) => {
    setAlertVariant(variant);
    setAlertMessage(message);
    setDismissCountDown(dissmissTimer);
    window.scrollTo(0,0)
  }

  const submitForm = async (e) => {
    e.preventDefault();
    const { basepath } = _config;
    const urlReturn = `${basepath}requests`;

    if (requestId){
      try {
        // If the submission requires additional DAAC review make sure that it's only being assigned to 1 DAAC
        // At the time of this implementation it was assumed that if an additional review was needed it would only go to one DAAC at a time.
        if (selected.length > 1 && requiresReview === true){
          showAlert(
            'Submissions requiring additional review can only be assigned to 1 DAAC. Please contact the EDPub team if you need to assign multiple DAACS for review',
            'danger',
            10
          )
          return
        }
        dispatch(assignDaacs({'id': requestId, 'daacs': selected, 'requires_review': requiresReview}))
        .then(response => {
          if (response.data?.error) {
            console.error('Error during daac assignment:', response.data.error);
            showAlert(
              'Error occured during DAAC Assignment. Please contact the EDPub team if issue persists.',
              'danger',
              10
            );
          } else {
            window.location.href = urlReturn;
          }
        });
      } catch (error) {
        console.error('Error during daac assignment:', error);
        showAlert(
          'Error occured during DAAC Assignment. Please contact the EDPub team if issue persists.',
          'danger',
          10
        )
      }
    }
  };  

  const cancelForm = (e) => {
    e.preventDefault();
    const { basepath } = _config;
    const urlReturn = `${basepath}requests`;
    setSelected([]);
    setSelectedDaacs({});
    window.location.href = urlReturn;
  };

  const containerStyles = {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxWidth: '1000px',
    margin: 'auto',
    textAlign: 'left',
    fontFamily: 'Arial, sans-serif',
    fontSize: '16px',
    padding: '20px',
    boxSizing: 'border-box',
  };

  const infoSectionStyles = {
    width: '100%',
    textAlign: 'left',
    marginTop: '16px',
    wordWrap: 'break-word',
    whiteSpace: 'normal',
  };

  /* Section Heading Styles */
  const sectionHeadingStyles =  {
    fontSize: '1.75em',
    marginBottom: '15px',
    borderBottom: '1px solid #cbcbcb',
    paddingBottom: '0.2em',
    fontWeight: 'normal',
}

  const thTdStyles = {
    padding: '8px',
    textAlign: 'left',
    fontSize: '16px',
    wordWrap: 'break-word',
    whiteSpace: 'normal',
  };

  const thStyles = {
    ...thTdStyles,
    fontWeight: 'bold',
    borderBottom: '2px solid #000',
  };

  const tdStyles = {
    ...thTdStyles,
    verticalAlign: 'middle',
    whiteSpace: 'normal',
    borderTop: '1px solid #dee2e6',
  };

  const tdDaacnameStyles = {
    ...thTdStyles,
    ...tdStyles,
    whiteSpace: 'nowrap',
  };

  const tdDaacnameDisabledTdStyles = {
    ...tdStyles,
    color: 'grey',
    whiteSpace: 'nowrap',
  };

  const disabledTdStyles = {
    ...tdStyles,
    color: 'grey',
  };

  const buttonStyles = {
    padding: '10px 20px',
    fontSize: '16px',
    margin: '10px',
    borderRadius: '5px',
    border: 'none',
    cursor: 'pointer',
  };

  const cancelButtonStyles = {
    ...buttonStyles,
    backgroundColor: '#6c757d',
    color: 'white',
  };

  const selectButtonStyles = {
    ...buttonStyles,
    backgroundColor: '#158749',
    color: 'white',
  };

  const disabledButtonStyles = {
    ...buttonStyles,
    backgroundColor: '#cccccc',
    color: '#666666',
  };

  const radioInputStyles = {
    cursor: 'pointer',
  };

  const radioLabelStyles = {
    display: 'flex',
    alignItems: 'center',
    marginRight: '15px',
  }

  // Define responsive styles
  const responsiveStyles = {
    container: {
      ...containerStyles,
      '@media (maxWidth: 768px)': {
        padding: '10px',
      },
    },
    table: {
      width: '100%',
      '@media (maxWidth: 768px)': {
        fontSize: '14px',
      },
    },
    buttonBar: {
      justifyContent: 'center',
      '@media (maxWidth: 768px)': {
        flexDirection: 'column',
        alignItems: 'stretch',
      },
    },
    button: {
      '@media (maxWidth: 768px)': {
        width: '100%',
        margin: '5px 0',
      },
    },
  };

  return (
    <div role="main">
      <Alert
        className="sticky-alert"
        show={dismissCountDown > 0}
        variant={alertVariant}
        dismissible
        onClose={() => setDismissCountDown(0)}
      >
        {alertMessage}
      </Alert>
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <div style={responsiveStyles.container}>
          <Form name="daacs_form" onSubmit={submitForm} id="daac-selection" style={responsiveStyles.container}>
            <FormGroup name="form-group-review" id="form-group-review">
              <FormLabel style={sectionHeadingStyles}>Requires Additional Review</FormLabel>
              <div className="mt-3" style={infoSectionStyles}>
                Does this data require additional review by a DAAC?
              </div>
              <div>
                    <label style={radioLabelStyles}>
                      <input type="radio" id="review_required_yes" onChange={() => setRequiresReview(true)} checked={requiresReview === true}/>
                      <label style={{ marginLeft: '5px', marginBottom: '0px', fontSize: '1em' }} htmlFor="review_required_yes">Yes</label>
                    </label>
                    <label style={radioLabelStyles}>
                      <input type="radio" id="review_required_no" onChange={() => setRequiresReview(false)} checked={requiresReview === false}/>
                      <label style={{ marginLeft: '5px', marginBottom: '0px', fontSize: '1em' }} htmlFor="review_required_no">No</label>
                    </label>
              </div>
              <br />
            </FormGroup>
            <FormGroup name="form-group" id="form-group">
              <FormLabel style={sectionHeadingStyles}>{strings.daac_assignment}</FormLabel>
              <div className="mt-3 disabled-daacs" style={infoSectionStyles}>
                Select one or more DAACs to assign to this data submission request. DAAC websites can be found in the <a href="/data_publication_guidelines#daacs" alt="go to NASA Daac Section" title="go NASA Daac Section">NASA DAACs</a> section of Earthdata Pub.
              </div>
              <Table striped hover className="mt-3" style={responsiveStyles.table}>
                <thead>
                  <tr>
                    <th style={thStyles}></th>
                    <th style={thStyles}>DAAC</th>
                    <th style={thStyles}>Discipline</th>
                  </tr>
                </thead>
                <tbody>
                  {daacs.map((item, index) => (
                    <tr key={index}>
                      <td style={item.hidden ? disabledTdStyles : tdStyles}>
                        <input
                          type="checkbox"
                          name="daac"
                          id={`${item.id}`}
                          value={item.long_name}
                          checked={selected.includes(item.id)}
                          disabled={item.hidden}
                          style={radioInputStyles}
                          onChange={() => setSelectedValues(item.url, item.id, item.short_name, item.long_name, item.description)}
                        />
                      </td>
                      <td style={item.hidden ? tdDaacnameDisabledTdStyles : tdDaacnameStyles}>{item.short_name}</td>
                      <td style={item.hidden ? disabledTdStyles : tdStyles}>{item.discipline}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <div className="info-section mt-3" style={infoSectionStyles}>
                {selectedDaacs && Object.keys(selectedDaacs).length > 0 && (
                  Object.keys(selectedDaacs).map((element) => 
                    <div key={selectedDaacs[element].id}>
                      <strong>{selectedDaacs[element].long_name}</strong>
                      <div id="selected_description">{selectedDaacs[element].description}</div>
                      {selectedDaacs[element].long_name !== 'Example DAAC'  && (
                        <div className="mt-3 link-to-daac">
                          For more information, visit{' '}
                          <a href={selectedDaacs[element].url} id="selected_daac_link" target="_blank" aria-label="Link to selected DAAC">
                            <span id="selected_daac">{selectedDaacs[element].short_name}</span>'s website
                          </a>
                        </div>
                      )}
                      <br/>
                    </div>
                  )
                )}
                {selected && (
                  <div className="button_bar mt-3 d-flex justify-content-between" style={responsiveStyles.buttonBar}>
                    <button onClick={cancelForm} aria-label="cancel button" id="daac_cancel_button" style={{ ...cancelButtonStyles, ...responsiveStyles.button }}>Cancel</button>
                    <button 
                      type="submit" 
                      aria-label="select button" 
                      id="daac_select_button" 
                      style={ selected.length > 0 && requiresReview !== null ? { ...selectButtonStyles, ...responsiveStyles.button } : { ...disabledButtonStyles }}
                      disabled= { selected.length > 0 && requiresReview !== null ? false : true }
                    >Select</button>
                  </div>
                )}
              </div>
            </FormGroup>
          </Form>
        </div>
      </div>
    </div>
  );
};

FormsOverview.propTypes = {
  forms: PropTypes.object,
  stats: PropTypes.object,
  requests: PropTypes.object,
  dispatch: PropTypes.func,
  config: PropTypes.object,
};

export { FormsOverview };

export default withRouter(connect(state => ({
  stats: state.stats,
  forms: state.forms,
  requests: state.requests,
  config: state.config,
}))(FormsOverview));
