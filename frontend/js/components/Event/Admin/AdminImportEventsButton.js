// @flow
import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Button, Modal } from 'react-bootstrap';
import { connect } from 'react-redux';
import { isSubmitting, isInvalid, isPristine, submit } from 'redux-form';
import AdminImportEventsForm, { formName } from './AdminImportEventsForm';
import CloseButton from '../../Form/CloseButton';
import SubmitButton from '../../Form/SubmitButton';
import type { GlobalState, Dispatch } from '../../../types';

type Props = {|
  submitting: boolean,
  pristine: boolean,
  invalid: boolean,
  submitForm: () => void,
|};

export const AdminImportEventsButton = ({ invalid, pristine, submitting, submitForm }: Props) => {
  const [showModal, setShowModal] = useState<boolean>(false);

  return (
    <div>
      <Button
        id="AdminImportEventsButton-import"
        bsStyle="default"
        className="mt-10"
        onClick={() => {
          setShowModal(true);
        }}>
        <FormattedMessage id="import" />
      </Button>
      <Modal
        animation={false}
        show={showModal}
        onHide={() => {
          setShowModal(false);
        }}
        bsSize="large"
        aria-labelledby="contained-modal-title-lg">
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-lg">
            <FormattedMessage id="modal-add-events-via-file" />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            <FormattedMessage id="import-events-helptext" />
          </p>
          <AdminImportEventsForm
            onClose={() => {
              setShowModal(false);
            }}
          />
        </Modal.Body>
        <Modal.Footer>
          <CloseButton
            onClose={() => {
              setShowModal(false);
            }}
          />
          <SubmitButton
            id="AdminImportEventsButton-submit"
            label="import"
            isSubmitting={submitting}
            disabled={invalid || pristine}
            onSubmit={() => submitForm()}
          />
        </Modal.Footer>
      </Modal>
    </div>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  submitting: isSubmitting(formName)(state),
  pristine: isPristine(formName)(state),
  invalid: isInvalid(formName)(state),
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  submitForm: () => {
    dispatch(submit(formName));
  },
});

export default connect<any, any, _, _, _, _>(
  mapStateToProps,
  mapDispatchToProps,
)(AdminImportEventsButton);
