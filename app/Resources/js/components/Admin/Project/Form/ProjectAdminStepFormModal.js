// @flow
import React from 'react';
import { submit } from 'redux-form';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Modal, Button } from 'react-bootstrap';
import type { Dispatch } from '~/types';

import ProjectAdminStepForm, { formName } from './ProjectAdminStepForm';

type Props = {|
  form: string,
  show: boolean,
  onClose: () => {},
  dispatch: Dispatch,
  submitting: boolean,
  step: ?{ title: string },
  index?: number,
|};

export function ProjectAdminStepFormModal(props: Props) {
  const { step, onClose, submitting, show, dispatch, form, index } = props;

  return (
    <Modal
      animation={false}
      show={show}
      onHide={onClose}
      bsSize="large"
      aria-labelledby="contained-modal-title-lg">
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-lg">
          <FormattedMessage id="admin.label.project_abstractstep" />
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ProjectAdminStepForm formName={form} step={step} index={index} handleClose={onClose} />
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onClose}>
          <FormattedMessage id="global.cancel" />
        </Button>
        <Button
          id="step-modal-submit"
          disabled={submitting}
          onClick={() => {
            dispatch(submit(formName));
          }}
          bsStyle="primary">
          {submitting ? (
            <FormattedMessage id="global.loading" />
          ) : step ? (
            <FormattedMessage id="global.edit" />
          ) : (
            <FormattedMessage id="group.create.button" />
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default connect()(ProjectAdminStepFormModal);
