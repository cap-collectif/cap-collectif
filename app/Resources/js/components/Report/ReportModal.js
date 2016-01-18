import React, {PropTypes} from 'react';
import {Modal} from 'react-bootstrap';
import {IntlMixin} from 'react-intl';

import CloseButton from '../Form/CloseButton';
import SubmitButton from '../Form/SubmitButton';
import ReportForm from './ReportForm';

const ReportModal = React.createClass({
  propTypes: {
    show: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  getInitialState() {
    return {
      isSubmitting: false,
    };
  },

  handleValidationSucess(data) {
    this.props.onSubmit(data)
        .then(() =>{
          this.setState({isSubmitting: false});
        });
  },

  handleSubmit() {
    this.setState({isSubmitting: true});
  },

  handleFailure() {
    this.setState({isSubmitting: false});
  },

  render() {
    const {isSubmitting} = this.state;
    const {onClose, show} = this.props;
    return (
      <Modal
        animation={false}
        show={show}
        onHide={onClose}
        bsSize="large"
        aria-labelledby="contained-modal-title-lg"
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-lg">
            {this.getIntlMessage('global.modal.report.title')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ReportForm
            isSubmitting={isSubmitting}
            onValidationFailure={this.handleFailure}
            onValidationSuccess={this.handleValidationSucess}
          />
        </Modal.Body>
        <Modal.Footer>
          <CloseButton onClose={onClose} />
          <SubmitButton
            id="confirm-opinion-source-report"
            label="global.report.submit"
            isSubmitting={isSubmitting}
            onSubmit={this.handleSubmit}
          />
        </Modal.Footer>
      </Modal>
    );
  },

});

export default ReportModal;
