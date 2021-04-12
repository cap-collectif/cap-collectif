// @flow
import React from 'react';
import { Modal } from 'react-bootstrap';
import { connect } from 'react-redux';
import { submit, isSubmitting } from 'redux-form';
import { FormattedMessage, useIntl } from 'react-intl';
import CloseButton from '../Form/CloseButton';
import SubmitButton from '../Form/SubmitButton';
import ReportForm, { formName } from './ReportForm';
import { closeModal } from '../../redux/modules/report';
import type { State, Dispatch } from '../../types';

type Props = {|
  dispatch: Dispatch,
  isLoading?: boolean,
  show: boolean,
  onSubmit: Function,
|};

const ReportModal = ({ dispatch, isLoading, show, onSubmit }: Props) => {
  const intl = useIntl();

  return (
    <Modal
      show={show}
      onHide={() => dispatch(closeModal())}
      aria-labelledby="report-modal-title-lg">
      <Modal.Header closeButton closeLabel={intl.formatMessage({ id: 'close.modal' })}>
        <Modal.Title id="report-modal-title-lg">
          <FormattedMessage id="global.modal.report.title" />
        </Modal.Title>
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
};

const mapStateToProps = (state: State, props) => ({
  isLoading: state.report.currentReportingModal === props.id && isSubmitting(formName)(state),
});

export default connect<any, any, _, _, _, _>(mapStateToProps)(ReportModal);
