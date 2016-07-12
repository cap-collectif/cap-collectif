import React, { PropTypes } from 'react';
import { Modal } from 'react-bootstrap';
import { connect } from 'react-redux';
import { IntlMixin } from 'react-intl';
import CloseButton from '../Form/CloseButton';
import SubmitButton from '../Form/SubmitButton';
import ReportForm from './ReportForm';
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
    const { dispatch, isLoading, show } = this.props;
    return (
      <Modal
        animation={false}
        show={show}
        onHide={() => dispatch(closeModal())}
        bsSize="large"
        aria-labelledby="contained-modal-title-lg"
      >
        <Modal.Header closeButton>
          <Modal.Title
            id="contained-modal-title-lg"
            children={this.getIntlMessage('global.modal.report.title')}
          />
        </Modal.Header>
        <Modal.Body>
          <ReportForm
            ref={c => this.form = c}
            onSubmit={this.props.onSubmit}
          />
        </Modal.Body>
        <Modal.Footer>
          <CloseButton onClose={() => dispatch(closeModal())} />
          <SubmitButton
            id="confirm-opinion-source-report"
            className="report-button-submit"
            label="global.report.submit"
            isSubmitting={isLoading}
            onSubmit={() => this.form.form.submit()}
          />
        </Modal.Footer>
      </Modal>
    );
  },

});

const mapStateToProps = (state) => {
  return {
    isLoading: state.report.isLoading,
  };
};

export default connect(mapStateToProps)(ReportModal);
