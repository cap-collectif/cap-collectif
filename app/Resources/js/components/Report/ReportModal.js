// @flow
import React from 'react';
import { Modal } from 'react-bootstrap';
import { connect } from 'react-redux';
import { submit, isSubmitting } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import CloseButton from '../Form/CloseButton';
import SubmitButton from '../Form/SubmitButton';
import ReportForm, { formName } from './ReportForm';
import { closeModal } from '../../redux/modules/report';
import type { State, Dispatch } from '../../types';

type Props = {
  dispatch: Dispatch,
  isLoading?: boolean,
  show: boolean,
  onSubmit: Function,
};

class ReportModal extends React.Component<Props> {
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
            children={<FormattedMessage id="global.modal.report.title" />}
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
  }
}

const mapStateToProps = (state: State, props) => ({
  isLoading: state.report.currentReportingModal === props.id && isSubmitting(formName)(state),
});

export default connect(mapStateToProps)(ReportModal);
