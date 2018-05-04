/**
 * @flow
 */
import React, { Component } from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { graphql, createFragmentContainer } from 'react-relay';
import { Button } from 'react-bootstrap';
import type { UserArchiveRequestButton_viewer } from './__generated__/UserArchiveRequestButton_viewer.graphql';
import RequestUserArchiveMutation from '../../../mutations/RequestUserArchiveMutation';

type Props = {
  viewer: UserArchiveRequestButton_viewer,
  intl: $npm$ReactIntl$IntlShape,
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
      // console.log('user action');
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

const container = injectIntl(UserArchiveRequestButton);

export default createFragmentContainer(
  container,
  graphql`
    fragment UserArchiveRequestButton_viewer on User {
      isArchiveReady
      isArchiveDeleted
      firstArchive
    }
  `,
);
