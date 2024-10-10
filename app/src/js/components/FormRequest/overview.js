import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withRouter, useParams } from 'react-router-dom';
import { connect, useDispatch } from 'react-redux';
import { listDaacs, initialize } from '../../actions';
import { Form, FormGroup, FormLabel, Button, Table } from 'react-bootstrap';
import _config from '../../config';

const FormsOverview = ({ forms }) => {
  const { daacid } = useParams(); 
  const [daacs, setDaacs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(listDaacs())
      .then((data) => {
        setDaacs(data.data);
        if(daacid) {
          const obj = (data.data).find(item => item.id === daacid);
          if(obj) setSelectedValues(obj.url, obj.id, obj.short_name, obj.long_name, obj.description);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [dispatch, daacid]);

  const [selected, setSelected] = useState(null);
  const [selectedDaac, setSelectedDaac] = useState({});

  const setSelectedValues = (url, id, short_name, long_name, description) => {
    setSelectedDaac({ url, id, short_name, long_name, description });
    setSelected(long_name);
  };

  const submitForm = async (e) => {
    e.preventDefault();
    const { basepath } = _config;
    const urlReturn = `${basepath}requests`;
  
    try {
      await dispatch(initialize(selectedDaac.id, { 'daac_id': selectedDaac.id }));
      window.location.href = urlReturn;
    } catch (error) {
      console.error('Error during form submission:', error);
    }
  };  

  const cancelForm = (e) => {
    e.preventDefault();
    const { basepath } = _config;
    const urlReturn = `${basepath}requests`;
    setSelected(null);
    setSelectedDaac({});
    window.location.href = urlReturn;
  };

  const containerStyles = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
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

  const radioInputStyles = {
    cursor: 'pointer',
  };

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
    <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
      <div style={responsiveStyles.container}>
        <Form name="daacs_form" onSubmit={submitForm} id="daac-selection" style={responsiveStyles.container}>
          <FormGroup name="form-group" id="form-group">
            <FormLabel>Select a DAAC</FormLabel>
            <div className="mt-3 disabled-daacs" style={infoSectionStyles}>
              Some DAACs are not selectable on the form because they are not yet using Earthdata Pub for data publication. To publish data with one of those DAACs, please contact them directly. DAAC websites can be found in the <a href="/data_publication_guidelines#daacs" alt="go to NASA Daac Section" title="go NASA Daac Section">NASA DAACs</a> section of Earthdata Pub.
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
                        type="radio"
                        name="daac"
                        id={`${item.id}`}
                        value={item.long_name}
                        onClick={() => setSelectedValues(item.url, item.id, item.short_name, item.long_name, item.description)}
                        checked={selected === item.long_name}
                        disabled={item.hidden}
                        style={radioInputStyles}
                        onChange={() => setSelected(item.long_name)}
                      />
                    </td>
                    <td style={item.hidden ? tdDaacnameDisabledTdStyles : tdDaacnameStyles}>{item.short_name}</td>
                    <td style={item.hidden ? disabledTdStyles : tdStyles}>{item.discipline}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <div className="info-section mt-3" style={infoSectionStyles}>
              {selected && selected !== 'Unknown DAAC' && (
                <div>
                  <strong>{selected}</strong>
                  <div id="selected_description">{selectedDaac.description}</div>
                </div>
              )}
              {selected && (
                <div className="mt-3 link-to-daac">
                  For more information, visit{' '}
                  <a href={selectedDaac.url} id="selected_daac_link" target="_blank" aria-label="Link to selected DAAC">
                    <span id="selected_daac">{selectedDaac.short_name}</span>'s website
                  </a>
                </div>
              )}
              {selected && (
                <div className="button_bar mt-3 d-flex justify-content-between" style={responsiveStyles.buttonBar}>
                  <button onClick={cancelForm} aria-label="cancel button" id="daac_cancel_button" style={{ ...cancelButtonStyles, ...responsiveStyles.button }}>Cancel</button>
                  <button type="submit" aria-label="select button" id="daac_select_button" style={{ ...selectButtonStyles, ...responsiveStyles.button }}>Select</button>
                </div>
              )}
            </div>
          </FormGroup>
        </Form>
      </div>
    </div>
  );
};

FormsOverview.propTypes = {
  forms: PropTypes.object,
  stats: PropTypes.object,
  dispatch: PropTypes.func,
  config: PropTypes.object,
};

export { FormsOverview };

export default withRouter(connect(state => ({
  stats: state.stats,
  forms: state.forms,
  config: state.config,
}))(FormsOverview));
