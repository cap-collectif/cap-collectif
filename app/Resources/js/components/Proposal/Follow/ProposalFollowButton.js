// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import {
  Dropdown,
  MenuItem,
  Panel,
  ListGroup,
  ListGroupItem,
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
      proposal.viewerFollowingConfiguration !== null &&
      typeof proposal.viewerFollowingConfiguration !== 'undefined'
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
            onClick={() =>
              FollowProposalMutation.commit({
                input: { proposalId: proposal.id, notifiedOf: 'MINIMAL' },
              }).then(() => {
                this.setState({
                  isJustFollowed: true,
                });
                return true;
              })
            }
            id={`proposal-follow-btn-${proposal.id}`}>
            <FormattedMessage id="follow" />
          </Button>
        </LoginOverlay>
      );
    }
    if (
      proposal.viewerFollowingConfiguration !== null &&
      typeof proposal.viewerFollowingConfiguration !== 'undefined'
    ) {
      return (
        <LoginOverlay>
          <span className="mb-0 custom-dropdown">
            <Dropdown
              className="mb-0 width250 custom-dropdown-bgd dropdown-button"
              id={`proposal-follow-btn-${proposal.id}`}
              defaultOpen={isJustFollowed}>
              <Dropdown.Toggle className="custom-dropdown-button">
                <FormattedMessage id="following" />
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Panel className="mb-0 b-none width250">
                  <Panel.Heading>
                    <FormattedMessage id="to-be-notified-by-email" />
                    <OverlayTrigger
                      placement="top"
                      overlay={
                        <Popover placement="top" className="in" id="pinned-label">
                          <FormattedMessage id="you-will-receive-a-summary-of-your-notifications-once-a-day" />
                        </Popover>
                      }>
                      <span className="cap-information ml-30" />
                    </OverlayTrigger>
                  </Panel.Heading>
                  <Panel.Body>
                    <div className="b-none mb-0" id={`proposal-follow-btn-${proposal.id}`}>
                      <ListGroup className="mb-0">
                        <ListGroupItem>
                          <Radio
                            id={`proposal-follow-btn-minimal-${proposal.id}`}
                            name="minimal"
                            className="proposal__follow__minimal"
                            checked={
                              proposal.viewerFollowingConfiguration === 'MINIMAL' ? 'checked' : ''
                            }
                            inline
                            onChange={() => this.changeFollowType(proposal, 'MINIMAL')}>
                            <b>
                              <FormattedMessage id="essential" />
                            </b>{' '}
                            <br />
                            <FormattedMessage id="updates-and-news" />
                          </Radio>
                        </ListGroupItem>
                        <ListGroupItem>
                          <Radio
                            name="essential"
                            id={`proposal-follow-btn-essential-${proposal.id}`}
                            className="proposal__follow__essential"
                            checked={
                              proposal.viewerFollowingConfiguration === 'ESSENTIAL' ? 'checked' : ''
                            }
                            onChange={() => this.changeFollowType(proposal, 'ESSENTIAL')}>
                            <b>
                              <FormattedMessage id="intermediate" />
                            </b>
                            <br />
                            <FormattedMessage id="updates-news-and-new-contributions" />
                          </Radio>
                        </ListGroupItem>
                        <ListGroupItem>
                          <Radio
                            name="all"
                            id={`proposal-follow-btn-all-${proposal.id}`}
                            className="proposal__follow__all"
                            checked={
                              proposal.viewerFollowingConfiguration === 'ALL' ? 'checked' : ''
                            }
                            onChange={() => this.changeFollowType(proposal, 'ALL')}>
                            <b>
                              <FormattedMessage id="complete" />
                            </b>
                            <br />
                            <FormattedMessage id="updates-news-new-contributions-votes-and-subscriptions" />
                          </Radio>
                        </ListGroupItem>
                      </ListGroup>
                    </div>
                  </Panel.Body>
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
    return null;
  }
}

export default createFragmentContainer(
  ProposalFollowButton,
  graphql`
    fragment ProposalFollowButton_proposal on Proposal
      @argumentDefinitions(isAuthenticated: { type: "Boolean", defaultValue: true }) {
      id
      viewerIsFollowing @include(if: $isAuthenticated)
      viewerFollowingConfiguration @include(if: $isAuthenticated)
    }
  `,
);
