// @flow
import React, { Component } from 'react';
import { FormattedMessage, injectIntl, type IntlShape } from 'react-intl';
import { ButtonGroup, Button, Modal } from 'react-bootstrap';
import CloseButton from '../../Form/CloseButton';
import { container as ProjectAdminFormDeprecated } from './Deprecated/ProjectAdminFormDeprecated';

type Props = {|
  intl: IntlShape,
|};

type State = {
  showModal: boolean,
};

export class ProjectCreateButton extends Component<Props, State> {
  state = {
    showModal: false,
  };

  render() {
    const { showModal } = this.state;

    return (
      <div>
        <Button
          id="add-a-project-button"
          bsStyle="default"
          className="mt-10 mr-10"
          onClick={() => {
            this.setState({ showModal: true });
          }}>
          <div id="add-a-project">
            <FormattedMessage id='global.add' />
          </div>
        </Button>
        <Modal
          animation={false}
          show={showModal}
          onHide={() => {
            this.setState({ showModal: false });
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
                  this.setState({ showModal: false });
                }}
              />
            </ButtonGroup>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export default injectIntl(ProjectCreateButton);
