// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Modal, Alert } from 'react-bootstrap';
import RequirementsForm from './RequirementsForm';

type Props = {
  show: boolean,
  step: {|
    +id: string,
    +requirements: {|
      +reason: ?string,
      +viewerMeetsTheRequirements: boolean,
    |},
  |},
  reason: ?string,
  handleClose: () => void,
};

export default class RequirementsModal extends React.Component<Props> {
  render() {
    const { show, handleClose, step, reason } = this.props;

    return (
      <Modal
        animation={false}
        show={show}
        bsSize="large"
        aria-labelledby="contained-modal-title-lg"
        onHide={handleClose}>
        <Modal.Header closeButton>
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
              <p>{reason}</p>
            </div>
            <RequirementsForm stepId={step.id} step={step} />
          </div>
        </Modal.Body>
      </Modal>
    );
  }
}
