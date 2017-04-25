import React, { PropTypes } from 'react';
import { Modal } from 'react-bootstrap';
import { connect } from 'react-redux';
import { submit, isSubmitting } from 'redux-form';
import { IntlMixin } from 'react-intl';
import CloseButton from '../Form/CloseButton';
import SubmitButton from '../Form/SubmitButton';
import ReportForm, { formName } from './ReportForm';
import { closeModal } from '../../redux/modules/report';

const ReportModal = React.createClass({
  displayName: 'ReportModal',
  propTypes: {
    dispatch: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired,
    show: PropTypes.bool.isRequired,
    onSubmit: PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { dispatch, isLoading, show, onSubmit } = this.props;
    return (
      <Modal
        show={show}
        onHide={() => dispatch(closeModal())}
        aria-labelledby="report-modal-title-lg">
        <Modal.Header closeButton>
          <Modal.Title
            id="report-modal-title-lg"
            children={this.getIntlMessage('global.modal.report.title')}
          />
        </Modal.Header>
        <Modal.Body>
          <ReportForm onSubmit={onSubmit} />
        </Modal.Body>
        <Modal.Footer>
          <CloseButton onClose={() => dispatch(closeModal())} />
          <SubmitButton
            id="report-button-submit"
            label="global.report.submit"
            isSubmitting={isLoading}
            onSubmit={() => {
              dispatch(submit(formName));
            }}
          />
        </Modal.Footer>
      </Modal>
    );
  },
});

const mapStateToProps = (state, ownProps) => {
  return {
    isLoading: state.report.currentReportingModal === ownProps.id &&
      isSubmitting(formName)(state),
  };
};

export default connect(mapStateToProps)(ReportModal);
