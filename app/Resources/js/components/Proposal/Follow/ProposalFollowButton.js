// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { Button } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import FollowProposalMutation from '../../../mutations/FollowProposalMutation';
import type { ProposalFollowButton_proposal } from './__generated__/ProposalFollowButton_proposal.graphql';
import UnfollowProposalMutation from '../../../mutations/UnfollowProposalMutation';
import LoginOverlay from '../../Utils/LoginOverlay';
import AppDispatcher from '../../../dispatchers/AppDispatcher';
import { UPDATE_ALERT } from '../../../constants/AlertConstants';

type Props = {
  proposal: ProposalFollowButton_proposal,
};
type State = {
  isHovering: boolean,
};

export class ProposalFollowButton extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isHovering: false,
    };
  }

  render() {
    const { proposal } = this.props;
    const { isHovering } = this.state;
    const buttonFollowId = proposal.viewerIsFollowing
      ? 'proposal-unfollow-btn'
      : 'proposal-follow-btn';
    let style = 'btn';
    let buttonText = '';
    if (!proposal.viewerIsFollowing) {
      buttonText = 'follow';
      style = 'btn';
    }
    if (proposal.viewerIsFollowing && isHovering) {
      buttonText = 'unfollow';
      style = 'btn btn-danger';
    }
    if (proposal.viewerIsFollowing && !isHovering) {
      buttonText = 'following';
      style = 'btn fifty-shade-of-grey ';
    }

    return (
      <LoginOverlay>
        <Button
          className={`${style}`}
          onMouseOver={() => {
            if (proposal.viewerIsFollowing) {
              this.setState({
                isHovering: true,
              });
            }
          }}
          onMouseOut={() => {
            if (proposal.viewerIsFollowing) {
              this.setState({
                isHovering: false,
              });
            }
          }}
          onClick={() => {
            if (proposal.viewerIsFollowing) {
              return UnfollowProposalMutation.commit({ input: { proposalId: proposal.id } }).then(
                () => {
                  AppDispatcher.dispatch({
                    actionType: UPDATE_ALERT,
                    alert: {
                      bsStyle: 'success',
                      content: 'flash-message-unfollow',
                    },
                  });
                  return true;
                },
              );
            }
            return FollowProposalMutation.commit({ input: { proposalId: proposal.id } }).then(
              () => {
                AppDispatcher.dispatch({
                  actionType: UPDATE_ALERT,
                  alert: {
                    bsStyle: 'success',
                    content: 'flash-message-following',
                  },
                });

                return true;
              },
            );
          }}
          id={buttonFollowId}>
          <FormattedMessage id={buttonText} />
        </Button>
      </LoginOverlay>
    );
  }
}

export default createFragmentContainer(
  ProposalFollowButton,
  graphql`
    fragment ProposalFollowButton_proposal on Proposal {
      id
      viewerIsFollowing
    }
  `,
);
