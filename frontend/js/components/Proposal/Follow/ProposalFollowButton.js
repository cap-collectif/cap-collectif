// @flow
import React from 'react';
import { graphql, useFragment } from 'react-relay';

import { FormattedMessage, useIntl } from 'react-intl';
import { Button, CapUIIcon, Menu, Heading, Popover, Flex, Icon, Text } from '@cap-collectif/ui';
import FollowProposalMutation from '../../../mutations/FollowProposalMutation';
import UpdateFollowProposalMutation from '../../../mutations/UpdateFollowProposalMutation';
import type { ProposalFollowButton_proposal$key } from '~relay/ProposalFollowButton_proposal.graphql';
import UnfollowProposalMutation from '../../../mutations/UnfollowProposalMutation';
import LoginOverlay from '../../Utils/NewLoginOverlay';

import type { SubscriptionTypeValue } from '~relay/UpdateFollowProposalMutation.graphql';

type Props = {|
  +proposal: ?ProposalFollowButton_proposal$key,
  isAuthenticated: boolean,
|};

const FRAGMENT = graphql`
  fragment ProposalFollowButton_proposal on Proposal
  @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
    id
    viewerIsFollowing @include(if: $isAuthenticated)
    viewerFollowingConfiguration @include(if: $isAuthenticated)
  }
`;

const ProposalFollowButton = ({ proposal: proposalFragment }: Props) => {
  const proposal = useFragment(FRAGMENT, proposalFragment);
  const intl = useIntl();
  const changeFollowType = (type: SubscriptionTypeValue) => {
    if (
      proposal?.viewerIsFollowing &&
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
  };

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

  if (!proposal?.viewerIsFollowing) {
    return (
      <LoginOverlay>
        <button
          type="button"
          className="btn btn-default proposal__button__follow"
          onClick={() =>
            FollowProposalMutation.commit({
              input: { proposalId: proposal?.id, notifiedOf: 'MINIMAL' },
            }).then(() => {
              return true;
            })
          }
          id={`proposal-follow-btn-${proposal?.id}`}>
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
              className="dropdown-button custom-dropdown-button proposal__button__follow_options"
              id={`proposal-follow-btn-${proposal.id}`}
              rightIcon={CapUIIcon.ArrowDownO}
              variant="secondary"
              variantColor="hierarchy">
              <FormattedMessage id="following" />
            </Button>
          }>
          <Menu.List maxHeight="unset" overflow="visible">
            <Menu.OptionGroup
              onChange={value => {
                changeFollowType(value);
              }}
              value={proposal.viewerFollowingConfiguration}
              type="radio"
              title={
                <Flex spacing={2} style={{ marginBottom: 'unset' }}>
                  <Heading as="h4" style={{ fontSize: '16px' }}>
                    {intl.formatMessage({ id: 'to-be-notified-by-email' })}
                  </Heading>
                  <Popover placement="top" disclosure={<Icon name={CapUIIcon.Info} />}>
                    <Popover.Body>
                      <FormattedMessage id="you-will-receive-a-summary-of-your-notifications-once-a-day" />
                    </Popover.Body>
                  </Popover>
                </Flex>
              }>
              <Menu.OptionItem
                value="MINIMAL"
                id={`proposal-follow-btn-minimal-${proposal.id}`}
                name="minimal"
                className="proposal__follow__minimal"
                style={{
                  alignItems: 'flex-start',
                  background: 'transparent',
                  borderStyle: 'solid',
                  borderWidth: '1px',
                  marginBottom: 0,
                  borderTop: 'none',
                }}>
                <Flex direction="column" ml={2}>
                  <Text fontSize={2} fontWeight="bold" marginBottom={0}>
                    {intl.formatMessage({ id: 'essential' })}
                  </Text>
                  <Text fontSize={2} marginBottom={0}>
                    {intl.formatMessage({ id: 'updates-and-news' })}
                  </Text>
                </Flex>
              </Menu.OptionItem>
              <Menu.OptionItem
                value="ESSENTIAL"
                name="essential"
                id={`proposal-follow-btn-essential-${proposal.id}`}
                className="proposal__follow__essential"
                style={{
                  alignItems: 'flex-start',
                  background: 'transparent',
                  borderStyle: 'solid',
                  borderWidth: '1px',
                  marginBottom: 0,
                  borderTop: 'none',
                }}>
                <Flex direction="column" ml={2}>
                  <Text fontSize={2} fontWeight="bold" marginBottom={0}>
                    {intl.formatMessage({ id: 'intermediate' })}
                  </Text>
                  <Text fontSize={2} marginBottom={0}>
                    {intl.formatMessage({ id: 'updates-news-and-new-contributions' })}
                  </Text>
                </Flex>
              </Menu.OptionItem>
              <Menu.OptionItem
                value="ALL"
                name="all"
                id={`proposal-follow-btn-all-${proposal.id}`}
                className="proposal__follow__all"
                style={{
                  alignItems: 'flex-start',
                  background: 'transparent',
                  borderStyle: 'solid',
                  borderWidth: '1px',
                  marginBottom: 0,
                  borderTop: 'none',
                }}>
                <Flex direction="column" ml={2}>
                  <Text fontSize={2} fontWeight="bold" marginBottom={0}>
                    {intl.formatMessage({ id: 'complete' })}
                  </Text>
                  <Text fontSize={2} marginBottom={0}>
                    {intl.formatMessage({
                      id: 'updates-news-new-contributions-votes-and-subscriptions',
                    })}{' '}
                  </Text>
                </Flex>
              </Menu.OptionItem>
            </Menu.OptionGroup>
            <Menu.Item
              border="none"
              bg="white"
              margin="0 !important"
              _hover={{
                textDecoration: 'underline',
              }}
              className="proposal__unfollow"
              id={`proposal-unfollow-btn-${proposal.id}`}
              onClick={() => {
                if (proposal.viewerIsFollowing) {
                  return UnfollowProposalMutation.commit({
                    input: { proposalId: proposal.id },
                  });
                }
              }}>
              <Text fontSize={2} marginBottom={0}>
                {intl.formatMessage({ id: 'unfollow' })}
              </Text>
            </Menu.Item>
          </Menu.List>
        </Menu>
      </LoginOverlay>
    );
  }
  return null;
};
export default ProposalFollowButton;
