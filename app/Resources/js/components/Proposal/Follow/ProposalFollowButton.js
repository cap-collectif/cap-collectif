// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import {
  Dropdown,
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

type Props = {
  proposal: ProposalFollowButton_proposal,
};

type State = {
  isJustFollowed: boolean,
};

export class ProposalFollowButton extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isJustFollowed: false,
    };
  }
  componentWillReceiveProps(nextProps: Props) {
    if (this.props !== nextProps) {
      this.setState({
        isJustFollowed: !!nextProps.proposal.viewerIsFollowing,
      });
    }
  }

  render() {
    const { proposal } = this.props;
    const { isJustFollowed } = this.state;
    if (!proposal.viewerIsFollowing) {
      return (
        <LoginOverlay>
          <Button
            className="btn btn-default"
            onClick={() => {
              return FollowProposalMutation.commit({
                input: { proposalId: proposal.id, notifiedOf: 'DEFAULT' },
              }).then(() => {
                this.setState({
                  isJustFollowed: true,
                });
                return true;
              });
            }}
            id={`proposal-follow-btn-${proposal.id}`}>
            <FormattedMessage id="follow" />
          </Button>
        </LoginOverlay>
      );
    }
    if (proposal.viewerAsFollower !== null && typeof proposal.viewerAsFollower !== 'undefined') {
      return (
        <LoginOverlay>
          <span className="mb-0 proposal-follow-dropdown">
            <Dropdown
              className="mb-0 width250 fifty-shade-of-grey"
              id={`proposal-follow-btn-${proposal.id}`}
              defaultOpen={isJustFollowed}>
              <Dropdown.Toggle>
                <FormattedMessage id="following" />
              </Dropdown.Toggle>
              <Dropdown.Menu>
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
                  <form>
                    <FormGroup className="bn mb-0" id={`proposal-follow-btn-${proposal.id}`}>
                      <ListGroup className="mb-0">
                        <ListGroupItem className="">
                          <Radio
                            id={`proposal-follow-btn-default-${proposal.id}`}
                            name="default"
                            title="default"
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
                            name="default_and_comments"
                            id={`proposal-follow-btn-default_and_comments-${proposal.id}`}
                            checked={
                              proposal.viewerAsFollower.notifiedOf === 'DEFAULT_AND_COMMENTS'
                                ? 'checked'
                                : ''
                            }
                            title="default_and_comments"
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
                                  return true;
                                });
                              }
                            }}>
                            <b>
                              <FormattedMessage id="progress-and-comments" />
                            </b>
                          </Radio>
                        </ListGroupItem>
                        <ListGroupItem className="">
                          <Radio
                            name="all"
                            title="all"
                            id={`proposal-follow-btn-all-${proposal.id}`}
                            checked={
                              proposal.viewerAsFollower.notifiedOf === 'ALL' ? 'checked' : ''
                            }
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
                  </form>
                </Panel>
                <MenuItem
                  eventKey="1"
                  className="mt--1"
                  id={`proposal-unfollow-btn-${proposal.id}`}
                  onClick={() => {
                    if (proposal.viewerIsFollowing) {
                      return UnfollowProposalMutation.commit({
                        input: { proposalId: proposal.id },
                      }).then(() => {
                        this.setState({
                          isJustFollowed: false,
                        });
                        return true;
                      });
                    }
                  }}>
                  <FormattedMessage id="unfollow" />
                </MenuItem>
              </Dropdown.Menu>
            </Dropdown>
          </span>
        </LoginOverlay>
      );
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
