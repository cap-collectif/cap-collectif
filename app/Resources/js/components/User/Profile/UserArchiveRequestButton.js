/**
 * @flow
 */
import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { graphql, createFragmentContainer } from 'react-relay';
import { Button } from 'react-bootstrap';
import type { UserArchiveRequestButton_viewer } from './__generated__/UserArchiveRequestButton_viewer.graphql';
import { baseUrl } from '../../../config';
import RequestUserArchiveMutation from '../../../mutations/RequestUserArchiveMutation';

type Props = {
  viewer: UserArchiveRequestButton_viewer,
};

type State = {
  loading: boolean,
};

export class UserArchiveRequestButton extends Component<Props, State> {
  state = {
    loading: false,
  };
  handleButtonClick = async () => {
    const { viewer: { isArchiveReady, isArchiveDeleted } } = this.props;
    if ((isArchiveReady && !isArchiveDeleted) || isArchiveDeleted) {
      window.open(`${baseUrl}/profile/download_archive`, '_blank');
    } else {
      this.setState({ loading: true });
      await RequestUserArchiveMutation.commit({});
      this.setState({ loading: false });
    }
  };

  render() {
    const { loading } = this.state;
    const { viewer: { isArchiveReady, isArchiveDeleted, firstArchive } } = this.props;
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
      <Button disabled={disabled} bsStyle="primary" onClick={this.handleButtonClick}>
        <FormattedMessage id={translationKey} />
      </Button>
    );
  }
}

export default createFragmentContainer(
  UserArchiveRequestButton,
  graphql`
    fragment UserArchiveRequestButton_viewer on User {
      isArchiveReady
      isArchiveDeleted
      firstArchive
    }
  `,
);
