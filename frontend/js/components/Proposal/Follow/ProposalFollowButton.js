// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';

import { FormattedMessage } from 'react-intl';
import { Button, CapUIIcon, Menu, Heading, Popover, Flex } from '@cap-collectif/ui';
import FollowProposalMutation from '../../../mutations/FollowProposalMutation';
import UpdateFollowProposalMutation from '../../../mutations/UpdateFollowProposalMutation';
import type { ProposalFollowButton_proposal } from '~relay/ProposalFollowButton_proposal.graphql';
import UnfollowProposalMutation from '../../../mutations/UnfollowProposalMutation';
import LoginOverlay from '../../Utils/NewLoginOverlay';

import type { SubscriptionTypeValue } from '~relay/UpdateFollowProposalMutation.graphql';

type Props = {|
  +proposal: ?ProposalFollowButton_proposal,
  isAuthenticated: boolean,
|};

export class ProposalFollowButton extends React.Component<Props> {
  changeFollowType(proposal: ProposalFollowButton_proposal, type: SubscriptionTypeValue) {
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
    if (!proposal)
      return (
        <Button
          disabled
          className="btn btn-default proposal__button__follow"
          id="proposal-follow-btn-placeholder">
          <i className="cap cap-rss mr-5" />
          <FormattedMessage id="follow" />
        </Button>
      );

    if (!proposal.viewerIsFollowing) {
      return (
        <LoginOverlay>
          <button
            type="button"
            className="btn btn-default proposal__button__follow"
            onClick={() =>
              FollowProposalMutation.commit({
                input: { proposalId: proposal.id, notifiedOf: 'MINIMAL' },
              }).then(() => {
                return true;
              })
            }
            id={`proposal-follow-btn-${proposal.id}`}>
            <i className="cap cap-rss mr-5" />
            <FormattedMessage id="follow" />
          </button>
        </LoginOverlay>
      );
    }
    if (
      proposal.viewerFollowingConfiguration !== null &&
      typeof proposal.viewerFollowingConfiguration !== 'undefined'
    ) {
      return (
        <LoginOverlay>
          <Menu
            placement="bottom"
            disclosure={
              <Button
                style={{ color: '#333', borderColor: '#333' }}
                className=" btn btn-default dropdown-button custom-dropdown-button proposal__button__follow_options"
                id={`proposal-follow-btn-${proposal.id}`}
                rightIcon={CapUIIcon.ArrowDownO}
                variant="secondary"
                variantColor="hierarchy">
                <FormattedMessage id="following" />
              </Button>
            }>
            <Menu.List maxHeight="unset" overflow="visible">
              <Menu.OptionGroup
                as="div"
                onChange={value => {
                  this.changeFollowType(proposal, value);
                }}
                value={proposal.viewerFollowingConfiguration}
                type="radio"
                title={
                  <Flex style={{ marginBottom: 'unset' }}>
                    <Heading as="h5">
                      <FormattedMessage id="to-be-notified-by-email" />
                    </Heading>
                    <Popover
                      placement="top"
                      disclosure={<span className="cap-information ml-30" />}>
                      <Popover.Body>
                        <FormattedMessage id="you-will-receive-a-summary-of-your-notifications-once-a-day" />
                      </Popover.Body>
                    </Popover>
                  </Flex>
                }>
                <Menu.OptionItem
                  as="a"
                  href="#"
                  value="MINIMAL"
                  id={`proposal-follow-btn-minimal-${proposal.id}`}
                  name="minimal"
                  className="proposal__follow__minimal">
                  <Flex direction="column">
                    <b>
                      <FormattedMessage id="essential" />
                    </b>
                    <FormattedMessage id="updates-and-news" />
                  </Flex>
                </Menu.OptionItem>
                <Menu.OptionItem
                  as="a"
                  href="#"
                  value="ESSENTIAL"
                  name="essential"
                  id={`proposal-follow-btn-essential-${proposal.id}`}
                  className="proposal__follow__essential">
                  <Flex direction="column">
                    <b>
                      <FormattedMessage id="intermediate" />
                    </b>
                    <FormattedMessage id="updates-news-and-new-contributions" />
                  </Flex>
                </Menu.OptionItem>
                <Menu.OptionItem
                  as="a"
                  href="#"
                  value="ALL"
                  name="all"
                  id={`proposal-follow-btn-all-${proposal.id}`}
                  className="proposal__follow__all">
                  <Flex direction="column">
                    <b>
                      <FormattedMessage id="complete" />
                    </b>
                    <FormattedMessage id="updates-news-new-contributions-votes-and-subscriptions" />
                  </Flex>
                </Menu.OptionItem>
              </Menu.OptionGroup>
              <Menu.Item
                as="a"
                href="#"
                className="proposal__unfollow"
                id={`proposal-unfollow-btn-${proposal.id}`}
                onClick={() => {
                  if (proposal.viewerIsFollowing) {
                    return UnfollowProposalMutation.commit({
                      input: { proposalId: proposal.id },
                    }).then(() => {
                      return true;
                    });
                  }
                }}>
                <FormattedMessage id="unfollow" />{' '}
              </Menu.Item>
            </Menu.List>
          </Menu>
        </LoginOverlay>
      );
    }
    return null;
  }
}

export default createFragmentContainer(ProposalFollowButton, {
  proposal: graphql`
    fragment ProposalFollowButton_proposal on Proposal
    @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      id
      viewerIsFollowing @include(if: $isAuthenticated)
      viewerFollowingConfiguration @include(if: $isAuthenticated)
    }
  `,
});
