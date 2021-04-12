// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage, useIntl } from 'react-intl';
import { Modal, Alert } from 'react-bootstrap';
import RequirementsForm from './RequirementsForm';
import type { RequirementsModal_step } from '~relay/RequirementsModal_step.graphql';

type Props = {|
  +show: boolean,
  +step: RequirementsModal_step,
  +handleClose: () => void,
|};

export const RequirementsModal = ({ show, handleClose, step }: Props) => {
  const intl = useIntl();

  return (
    <Modal
      animation={false}
      show={show}
      bsSize="large"
      aria-labelledby="contained-modal-title-lg"
      onHide={handleClose}>
      <Modal.Header closeButton closeLabel={intl.formatMessage({ id: 'close.modal' })}>
        <Modal.Title id="contained-modal-title-lg">
          <FormattedMessage id="requirements" />
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {step.requirements.viewerMeetsTheRequirements && (
          <Alert bsStyle="success">
            <FormattedMessage id="all-requirements-filled-close-and-participate" />
          </Alert>
        )}

        <div className="row">
          <div className="col-xs-12">
            <p>{step.requirements.reason}</p>
          </div>
          <RequirementsForm stepId={step.id} step={step} />
        </div>
      </Modal.Body>
    </Modal>
  );
};

const container = connect<any, any, _, _, _, _>()(RequirementsModal);
export default createFragmentContainer(container, {
  step: graphql`
    fragment RequirementsModal_step on ConsultationStep
      @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      ...RequirementsForm_step @arguments(isAuthenticated: $isAuthenticated)

      id
      requirements {
        viewerMeetsTheRequirements @include(if: $isAuthenticated)
        reason
      }
    }
  `,
});
