/**
 * @flow
 */
import React, { Component } from 'react';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import { graphql, createFragmentContainer } from 'react-relay';
import { Button, Modal } from 'react-bootstrap';
import type { UserArchiveRequestButton_viewer } from '~relay/UserArchiveRequestButton_viewer.graphql';
import CloseButton from '../../Form/CloseButton';
import { baseUrl } from '../../../config';
import RequestUserArchiveMutation from '../../../mutations/RequestUserArchiveMutation';

type Props = {
  viewer: UserArchiveRequestButton_viewer,
};

type State = {
  loading: boolean,
  showModal: boolean,
};

export class UserArchiveRequestButton extends Component<Props, State> {
  state = {
    loading: false,
    showModal: false,
  };

  handleButtonClick = async () => {
    const {
      viewer: { isArchiveReady, isArchiveDeleted },
    } = this.props;
    if ((isArchiveReady && !isArchiveDeleted) || isArchiveDeleted) {
      window.open(`${baseUrl}/profile/download_archive`, '_blank');
    } else {
      this.setState({ loading: true });
      await RequestUserArchiveMutation.commit({});
      this.setState({ loading: false, showModal: true });
    }
  };

  render() {
    const { loading } = this.state;
    const {
      viewer: { email, isArchiveReady, isArchiveDeleted, firstArchive },
    } = this.props;
    let translationKey = loading ? 'global.loading' : 'request-my-copy';
    let disabled = loading;
    if (!firstArchive) {
      if (!isArchiveReady && !isArchiveDeleted) {
        translationKey = loading ? 'global.loading' : 'preparation-in-progress';
        disabled = loading || true;
      } else if (isArchiveReady && !isArchiveDeleted) {
        translationKey = loading ? 'global.loading' : 'download-my-copy';
        disabled = loading || false;
      } else if (isArchiveDeleted) {
        translationKey = loading ? 'global.loading' : 'download-my-copy';
        disabled = loading || false;
      }
    }
    return (
      <div>
        <Button disabled={disabled} bsStyle="primary" onClick={this.handleButtonClick}>
          <FormattedMessage id={translationKey} />
        </Button>
        <Modal
          animation={false}
          show={this.state.showModal}
          onHide={() => {
            this.setState({ showModal: false });
          }}
          aria-labelledby="contained-modal-title-lg">
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-lg">
              <FormattedMessage id="copy-request-registered" />
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <FormattedHTMLMessage
              id="data-copy-request-modal-text"
              values={{ emailAddress: email }}
            />
          </Modal.Body>
          <Modal.Footer>
            <CloseButton
              label="global.close"
              onClose={() => {
                this.setState({ showModal: false });
              }}
            />
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export default createFragmentContainer(
  UserArchiveRequestButton,
  graphql`
    fragment UserArchiveRequestButton_viewer on User {
      email
      isArchiveReady
      isArchiveDeleted
      firstArchive
    }
  `,
);
