// @flow
import React, { useState } from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { ButtonGroup, Button, Modal } from 'react-bootstrap';
import CloseButton from '../../Form/CloseButton';
import { container as ProjectAdminFormDeprecated } from './Deprecated/ProjectAdminFormDeprecated';

export const ProjectCreateButton = () => {
  const [showModal, setShowModal] = useState<boolean>(false);

  return (
    <div>
      <Button
        id="add-a-project-button"
        bsStyle="default"
        className="mt-10 mr-10"
        onClick={() => {
          setShowModal(true);
        }}>
        <div id="add-a-project">
          <FormattedMessage id="global.add" />
        </div>
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
            <FormattedMessage id="create-a-project" />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ProjectAdminFormDeprecated />
        </Modal.Body>
        <Modal.Footer>
          <ButtonGroup className="pl-0 d-flex d-inline-block">
            <CloseButton
              onClose={() => {
                setShowModal(false);
              }}
            />
          </ButtonGroup>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default injectIntl(ProjectCreateButton);
