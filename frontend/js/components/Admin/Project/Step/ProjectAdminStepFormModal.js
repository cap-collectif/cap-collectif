// @flow
import React from 'react';
import { Modal } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { STEP_TYPES } from '~/constants/StepTypeConstants';
import ProjectAdminStepForm from './ProjectAdminStepForm';
import { StepModalTitle, StepModalContainer } from '../Form/ProjectAdminForm.style';

type Props = {|
  form: string,
  show: boolean,
  onClose: () => void,
  step: ?{ +title: string },
  type: string,
  index?: number,
  isCreating?: boolean,
|};

export function ProjectAdminStepFormModal({
  step,
  onClose,
  show,
  form,
  index,
  type,
  isCreating,
}: Props) {
  const stepType = STEP_TYPES.find(s => s.value === type);
  const modalTitle = stepType ? (isCreating ? stepType.addLabel : stepType.editLabel) : '';
  return (
    <StepModalContainer
      animation={false}
      show={show}
      onHide={onClose}
      dialogClassName="custom-modal-dialog"
      bsSize="large"
      aria-labelledby="contained-modal-title-lg">
      <Modal.Header closeButton>
        <StepModalTitle id="contained-modal-title-lg">
          <FormattedMessage id={modalTitle} />
        </StepModalTitle>
      </Modal.Header>
      <ProjectAdminStepForm
        formName={form}
        step={{ ...step, type }}
        index={index}
        handleClose={onClose}
      />
    </StepModalContainer>
  );
}

export default ProjectAdminStepFormModal;
