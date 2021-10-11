// @flow
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { Modal } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { STEP_TYPES } from '~/constants/StepTypeConstants';
import ProjectAdminStepForm from './ProjectAdminStepForm';
import { StepModalTitle, StepModalContainer } from '../Form/ProjectAdminForm.style';
import type { ProjectAdminStepFormModal_project } from '~relay/ProjectAdminStepFormModal_project.graphql';

type Props = {|
  form: string,
  show: boolean,
  onClose: () => void,
  step: ?{ +title: string },
  type: string,
  index?: number,
  isCreating?: boolean,
  project: ProjectAdminStepFormModal_project,
|};

export const ProjectAdminStepFormModal = ({
  step,
  onClose,
  show,
  form,
  index,
  type,
  isCreating,
  project,
}: Props) => {
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
        isCreating={isCreating}
        formName={form}
        step={{ ...step, __typename: type }}
        index={index}
        handleClose={onClose}
        project={project}
      />
    </StepModalContainer>
  );
};

export default createFragmentContainer(ProjectAdminStepFormModal, {
  project: graphql`
    fragment ProjectAdminStepFormModal_project on Project {
      ...ProjectAdminStepForm_project
    }
  `,
});
