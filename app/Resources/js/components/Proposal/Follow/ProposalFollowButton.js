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
  state = {
    isJustFollowed: false,
  };
  componentWillReceiveProps(nextProps: Props) {
    if (this.props !== nextProps) {
      this.setState({
        isJustFollowed: !!nextProps.proposal.viewerIsFollowing,
      });
    }
  }
  changeFollowType(proposal: ProposalFollowButton_proposal, type: string) {
    if (
      proposal.viewerIsFollowing &&
      proposal.followerConfiguration !== null &&
      typeof proposal.followerConfiguration !== 'undefined'
    ) {
      return UpdateFollowProposalMutation.commit({
        input: {
          proposalId: proposal.id,
          notifiedOf: type,
        },
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
            className="btn btn-default proposal__button__follow"
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
    if (
      proposal.followerConfiguration !== null &&
      typeof proposal.followerConfiguration !== 'undefined'
    ) {
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
                            className="proposal__follow__advancement"
                            checked={
                              proposal.followerConfiguration.notifiedOf === 'DEFAULT'
                                ? 'checked'
                                : ''
                            }
                            inline
                            onClick={() => {
                              return this.changeFollowType(proposal, 'DEFAULT');
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
                            className="proposal__follow__default_and_comments"
                            checked={
                              proposal.followerConfiguration.notifiedOf === 'DEFAULT_AND_COMMENTS'
                                ? 'checked'
                                : ''
                            }
                            onClick={() => {
                              return this.changeFollowType(proposal, 'DEFAULT_AND_COMMENTS');
                            }}>
                            <b>
                              <FormattedMessage id="progress-and-comments" />
                            </b>
                          </Radio>
                        </ListGroupItem>
                        <ListGroupItem className="">
                          <Radio
                            name="all"
                            id={`proposal-follow-btn-all-${proposal.id}`}
                            className="proposal__follow__all"
                            checked={
                              proposal.followerConfiguration.notifiedOf === 'ALL' ? 'checked' : ''
                            }
                            onClick={() => {
                              return this.changeFollowType(proposal, 'ALL');
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
                  className="proposal__unfollow"
                  id={`proposal-unfollow-btn-${proposal.id}`}
                  onClick={() => {
                    if (proposal.viewerIsFollowing) {
                      return UnfollowProposalMutation.commit({
                        input: { proposalId: proposal.id },
                      }).then(() => {
                        this.setState({
                          isJustFollowed: false,
                        });
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
      followerConfiguration {
        notifiedOf
      }
    }
  `,
);
