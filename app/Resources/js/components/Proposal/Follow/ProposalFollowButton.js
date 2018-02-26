// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import {
  DropdownButton,
  MenuItem,
  Panel,
  ListGroup,
  ListGroupItem,
  FormGroup,
  Radio,
  Button,
  Popover,
  OverlayTrigger,
} from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import FollowProposalMutation from '../../../mutations/FollowProposalMutation';
import UpdateFollowProposalMutation from '../../../mutations/UpdateFollowProposalMutation';
import type { ProposalFollowButton_proposal } from './__generated__/ProposalFollowButton_proposal.graphql';
import UnfollowProposalMutation from '../../../mutations/UnfollowProposalMutation';
import LoginOverlay from '../../Utils/LoginOverlay';
import AppDispatcher from '../../../dispatchers/AppDispatcher';
import { UPDATE_ALERT } from '../../../constants/AlertConstants';

type Props = {
  proposal: ProposalFollowButton_proposal,
};

export class ProposalFollowButton extends React.Component<Props> {
  render() {
    const { proposal } = this.props;
    if (!proposal.viewerIsFollowing) {
      return (
        <LoginOverlay>
          <Button
            className="btn btn-default"
            onClick={() => {
              return FollowProposalMutation.commit({
                input: { proposalId: proposal.id, notifiedOf: 'DEFAULT' },
              }).then(() => {
                AppDispatcher.dispatch({
                  actionType: UPDATE_ALERT,
                  alert: {
                    bsStyle: 'success',
                    content: 'flash-message-following',
                  },
                });
                return true;
              });
            }}
            id="proposal-follow-btn">
            <FormattedMessage id="follow" />
          </Button>
        </LoginOverlay>
      );
    }
    if (proposal.viewerAsFollower !== null && typeof proposal.viewerAsFollower !== 'undefined') {
      return (
        <LoginOverlay>
          <span className="mb-0 proposal-follow-dropdown">
            <DropdownButton
              className="mb-0 width250"
              id="proposal-follow-btn"
              title={<FormattedMessage id="following" />}>
              <Panel
                className="mb-0 bn width250"
                header={
                  <span>
                    <FormattedMessage id="to-be-notified-of-new-of" />
                    <OverlayTrigger
                      placement="top"
                      overlay={
                        <Popover placement="top" className="in" id="pinned-label">
                          <FormattedMessage id="you-will-receive-a-summary-of-your-notifications-once-a-day" />
                        </Popover>
                      }>
                      <a>
                        <span className="cap-information" />
                      </a>
                    </OverlayTrigger>
                  </span>
                }>
                <FormGroup className="bn mb-0">
                  <ListGroup className="mb-0">
                    <ListGroupItem className="">
                      <Radio
                        name="radioGroup"
                        checked={
                          proposal.viewerAsFollower.notifiedOf === 'DEFAULT' ? 'checked' : ''
                        }
                        inline
                        onClick={() => {
                          if (
                            proposal.viewerIsFollowing &&
                            proposal.viewerAsFollower !== null &&
                            typeof proposal.viewerAsFollower !== 'undefined'
                          ) {
                            return UpdateFollowProposalMutation.commit({
                              input: {
                                proposalId: proposal.id,
                                followerId: proposal.viewerAsFollower.id,
                                notifiedOf: 'DEFAULT',
                              },
                            }).then(() => {
                              AppDispatcher.dispatch({
                                actionType: UPDATE_ALERT,
                                alert: {
                                  bsStyle: 'success',
                                  content: 'flash-message-follow-update',
                                },
                              });
                              return true;
                            });
                          }
                        }}>
                        <b>
                          <FormattedMessage id="the-progress" />
                        </b>{' '}
                        <br />
                        <FormattedMessage id="list-of-progress-notifications" />
                      </Radio>
                    </ListGroupItem>
                    <ListGroupItem className="">
                      <Radio
                        name="radioGroup"
                        checked={
                          proposal.viewerAsFollower.notifiedOf === 'DEFAULT_AND_COMMENTS'
                            ? 'checked'
                            : ''
                        }
                        inline
                        onClick={() => {
                          if (
                            proposal.viewerIsFollowing &&
                            proposal.viewerAsFollower !== null &&
                            typeof proposal.viewerAsFollower !== 'undefined'
                          ) {
                            return UpdateFollowProposalMutation.commit({
                              input: {
                                proposalId: proposal.id,
                                followerId: proposal.viewerAsFollower.id,
                                notifiedOf: 'DEFAULT_AND_COMMENTS',
                              },
                            }).then(() => {
                              AppDispatcher.dispatch({
                                actionType: UPDATE_ALERT,
                                alert: {
                                  bsStyle: 'success',
                                  content: 'flash-message-follow-update',
                                },
                              });
                              return true;
                            });
                          }
                        }}>
                        <b>
                          <FormattedMessage id="progress-and-comments" />
                        </b>
                        <br />

                        <FormattedMessage id="list-of-progress-notifications-and-comments" />
                      </Radio>
                    </ListGroupItem>
                    <ListGroupItem className="">
                      <Radio
                        name="radioGroup"
                        checked={proposal.viewerAsFollower.notifiedOf === 'ALL' ? 'checked' : ''}
                        inline
                        onClick={() => {
                          if (
                            proposal.viewerIsFollowing &&
                            proposal.viewerAsFollower !== null &&
                            typeof proposal.viewerAsFollower !== 'undefined'
                          ) {
                            return UpdateFollowProposalMutation.commit({
                              input: {
                                proposalId: proposal.id,
                                followerId: proposal.viewerAsFollower.id,
                                notifiedOf: 'ALL',
                              },
                            }).then(() => {
                              AppDispatcher.dispatch({
                                actionType: UPDATE_ALERT,
                                alert: {
                                  bsStyle: 'success',
                                  content: 'flash-message-follow-update',
                                },
                              });
                              return true;
                            });
                          }
                        }}>
                        <b>
                          <FormattedMessage id="all-activities" />
                        </b>
                        <br />
                        <FormattedMessage id="list-of-activity-notifications" />
                      </Radio>
                    </ListGroupItem>
                  </ListGroup>
                </FormGroup>
              </Panel>
              <MenuItem
                eventKey="1"
                className="mt--1"
                onClick={() => {
                  if (proposal.viewerIsFollowing) {
                    return UnfollowProposalMutation.commit({
                      input: { proposalId: proposal.id },
                    }).then(() => {
                      AppDispatcher.dispatch({
                        actionType: UPDATE_ALERT,
                        alert: {
                          bsStyle: 'success',
                          content: 'flash-message-unfollow',
                        },
                      });
                      return true;
                    });
                  }
                }}>
                <FormattedMessage id="unfollow" />
              </MenuItem>
            </DropdownButton>
          </span>
        </LoginOverlay>
      );
    }
    if (proposal.viewerIsFollowing && !isHovering) {
      buttonText = 'following';
      style = 'btn-default_focus';
      bsStyle = 'default';
    }
  }
}

export default createFragmentContainer(
  ProposalFollowButton,
  graphql`
    fragment ProposalFollowButton_proposal on Proposal {
      id
      viewerIsFollowing
      viewerAsFollower {
        id
        notifiedOf
      }
    }
  `,
);
