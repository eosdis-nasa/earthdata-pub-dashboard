import React from 'react';
import { BrowserRouter as Router, Route, Switch, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
//import Sidebar from './components/Sidebar/sidebar';
import { Button, Modal } from 'react-bootstrap';
import FormQuestions from './questions';
import { getRequest, getForm } from '../../actions'; // Adjust the import path as necessary
import ErrorReport from '../Errors/report';

class FormQuestions2 extends React.Component {
  constructor() {
    super();
    this.displayName = 'Data Request';
    this.state = {
      header: 'Data Request', // Default header
      formData: null, // State to store form data
      requestData: null,
      showErrorModal: false, 
      errorMessage: '',
      validForm: true 
    };
  }

  componentDidMount() {
    const { id } = this.props.match.params;
    this.fetchFormData(id);
  }

  async fetchFormData(id) {
    const { dispatch } = this.props;
    try {
      const requestResp = await dispatch(getRequest(id));
      const { data: requestData = [] } = requestResp;
      const formResp = await dispatch(getForm(requestData.step_data.form_id, requestData.daac_id));
      if (requestResp.data.step_data.type !== 'form'){
        this.setState({validForm: false, errorMessage: 'Current workflow step is not a form. Please navigate to the request to see the current step.' });
      }
      const { data: formData } = formResp;
      this.setState({ requestData, formData, header: formData.long_name || 'Data Request' });
    } catch (error) {
      console.error('Error fetching data:', error);
      this.setState({
        showErrorModal: true, 
        errorMessage: 'An error occurred while fetching requested data.' 
      });
    }
  }

  handleCloseModal = () => {
    this.setState({ showErrorModal: false });
  };

  render() {
    const { pathname } = this.props.location;
    const { requestData, header, formData, showErrorModal, errorMessage, validForm } = this.state;
    const showSidebar = pathname !== '/forms/add';

    return (
      <div className='page__forms'>
        <div className='content__header'>
          <div className='row'>
            <h1 className='heading--xlarge heading--shared-content'>{header}</h1>
          </div>
        </div>
        <div className='page__content'>
          <div className='wrapper__sidebar'>
            <div className={showSidebar ? 'page__content--shortened padding-zero' : 'page__content'}>
              <Switch>
                <Route
                  path='/form/questions/:id'
                  render={(props) => validForm? <FormQuestions {...props} formData={formData} requestData={requestData} sectionHeader = {header}/> :  <ErrorReport report={errorMessage} />}
                />
              </Switch>
            </div>
          </div>
        </div>
        {showErrorModal && (
          <Modal show={showErrorModal} onHide={this.handleCloseModal} className="custom-modal">
            <Modal.Header closeButton>
              <Modal.Title>Error</Modal.Title>
            </Modal.Header>
            <Modal.Body>{errorMessage}</Modal.Body>
            <Modal.Footer>
              <Button variant="primary" onClick={this.handleCloseModal}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        )}
      </div>
    );
  }
}

FormQuestions2.propTypes = {
  children: PropTypes.object,
  location: PropTypes.object,
  match: PropTypes.object.isRequired,
  params: PropTypes.object,
  dispatch: PropTypes.func.isRequired,
};

const ConnectedFormQuestions = withRouter(connect()(FormQuestions2));

// const App = () => (
//   <Router>
//     <Switch>
//       <Route path="/form/questions/:id" component={ConnectedFormQuestions} />
//     </Switch>
//   </Router>
// );

export default ConnectedFormQuestions;
