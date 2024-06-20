import * as React from 'react'
import { graphql, useFragment } from 'react-relay'
import { FormattedMessage, useIntl } from 'react-intl'
import { Button, CapUIIcon, Menu, Heading, Popover, Flex, Icon, Text } from '@cap-collectif/ui'
import FollowOpinionMutation from '../../../mutations/FollowOpinionMutation'
import UpdateFollowOpinionMutation from '../../../mutations/UpdateFollowOpinionMutation'
import UnfollowOpinionMutation from '../../../mutations/UnfollowOpinionMutation'
import LoginOverlay from '../../Utils/LoginOverlay'
import type { SubscriptionTypeValue } from '~relay/UpdateFollowOpinionMutation.graphql'
import type { OpinionFollowButton_opinion$key } from '~relay/OpinionFollowButton_opinion.graphql'
type Props = {
  readonly opinion: OpinionFollowButton_opinion$key
}
const OPINION_FRAGMENT = graphql`
  fragment OpinionFollowButton_opinion on OpinionOrVersion
  @argumentDefinitions(isAuthenticated: { type: "Boolean", defaultValue: true }) {
    ... on Opinion {
      id
      viewerIsFollowing @include(if: $isAuthenticated)
      viewerFollowingConfiguration @include(if: $isAuthenticated)
    }
    ... on Version {
      id
      viewerIsFollowing @include(if: $isAuthenticated)
      viewerFollowingConfiguration @include(if: $isAuthenticated)
    }
  }
`

const OpinionFollowButton = ({ opinion: opinionRef }: Props) => {
  const opinion = useFragment(OPINION_FRAGMENT, opinionRef)
  const intl = useIntl()

  const changeFollowType = (type: SubscriptionTypeValue) => {
    if (
      opinion.id &&
      opinion.viewerIsFollowing &&
      opinion.viewerFollowingConfiguration !== null &&
      typeof opinion.viewerFollowingConfiguration !== 'undefined'
    ) {
      return UpdateFollowOpinionMutation.commit({
        input: {
          opinionId: opinion.id,
          notifiedOf: type,
        },
      })
    }
  }

  if (!opinion.viewerIsFollowing && opinion.id) {
    return (
      <LoginOverlay>
        <button
          type="button"
          className="btn btn-default opinion__button__follow mr-5"
          onClick={() =>
            opinion.id &&
            FollowOpinionMutation.commit({
              input: {
                opinionId: opinion.id,
                notifiedOf: 'MINIMAL',
              },
            })
          }
          id={`opinion-follow-btn-${opinion.id || ''}`}
        >
          <i className="cap cap-rss" />
          <FormattedMessage id="follow" />
        </button>
      </LoginOverlay>
    )
  }

  if (
    opinion.id &&
    opinion.viewerFollowingConfiguration !== null &&
    typeof opinion.viewerFollowingConfiguration !== 'undefined'
  ) {
    return (
      <LoginOverlay>
        <Menu
          placement="bottom"
          disclosure={
            <Button
              style={{
                color: '#333',
                borderColor: '#333',
              }}
              className="dropdown-button custom-dropdown-button opinion__button__follow_options"
              id={`opinion-follow-btn-${opinion.id || ''}`}
              rightIcon={CapUIIcon.ArrowDownO}
              variant="secondary"
              variantColor="hierarchy"
            >
              <FormattedMessage id="following" />
            </Button>
          }
        >
          <Menu.List maxHeight="unset" overflow="visible">
            <Menu.OptionGroup
              onChange={value => {
                changeFollowType(value)
              }}
              value={opinion.viewerFollowingConfiguration}
              type="radio"
              title={
                <Flex
                  spacing={2}
                  style={{
                    marginBottom: 'unset',
                  }}
                >
                  <Heading
                    as="h4"
                    style={{
                      fontSize: '16px',
                    }}
                  >
                    {intl.formatMessage({
                      id: 'to-be-notified-by-email',
                    })}
                  </Heading>
                  <Popover placement="top" disclosure={<Icon name={CapUIIcon.Info} />}>
                    <Popover.Body>
                      {intl.formatMessage({
                        id: 'you-will-receive-a-summary-of-your-notifications-once-a-day',
                      })}
                    </Popover.Body>
                  </Popover>
                </Flex>
              }
            >
              <Menu.OptionItem
                value="MINIMAL"
                id={`opinion-follow-btn-minimal-${opinion.id || ''}`}
                name="minimal"
                className="opinion__follow__minimal"
                style={{
                  alignItems: 'flex-start',
                  background: 'transparent',
                  borderStyle: 'solid',
                  borderWidth: '1px',
                  marginBottom: 0,
                  borderTop: 'none',
                }}
              >
                <Flex direction="column" ml={2}>
                  <Text fontSize={2} fontWeight="bold" marginBottom={0}>
                    {intl.formatMessage({
                      id: 'essential',
                    })}
                  </Text>
                  <Text fontSize={2} marginBottom={0}>
                    {intl.formatMessage({
                      id: 'updates-and-news',
                    })}
                  </Text>
                </Flex>
              </Menu.OptionItem>
              <Menu.OptionItem
                value="ESSENTIAL"
                name="essential"
                id={`opinion-follow-btn-essential-${opinion.id || ''}`}
                className="opinion__follow__essential"
                style={{
                  alignItems: 'flex-start',
                  background: 'transparent',
                  borderStyle: 'solid',
                  borderWidth: '1px',
                  marginBottom: 0,
                  borderTop: 'none',
                }}
              >
                <Flex direction="column" ml={2}>
                  <Text fontSize={2} fontWeight="bold" marginBottom={0}>
                    {intl.formatMessage({
                      id: 'intermediate',
                    })}
                  </Text>
                  <Text fontSize={2} marginBottom={0}>
                    {intl.formatMessage({
                      id: 'updates-news-and-new-contributions',
                    })}
                  </Text>
                </Flex>
              </Menu.OptionItem>
              <Menu.OptionItem
                value="ALL"
                name="all"
                id={`opinion-follow-btn-all-${opinion.id || ''}`}
                className="opinion__follow__all"
                style={{
                  alignItems: 'flex-start',
                  background: 'transparent',
                  borderStyle: 'solid',
                  borderWidth: '1px',
                  marginBottom: 0,
                  borderTop: 'none',
                }}
              >
                <Flex direction="column" ml={2}>
                  <Text fontSize={2} fontWeight="bold" marginBottom={0}>
                    {intl.formatMessage({
                      id: 'complete',
                    })}
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
              as="a"
              href="#"
              className="opinion__unfollow"
              id={`opinion-unfollow-btn-${opinion.id || ''}`}
              onClick={() => {
                if (opinion.viewerIsFollowing) {
                  return UnfollowOpinionMutation.commit({
                    input: {
                      opinionId: opinion.id,
                    },
                  }).then(() => {
                    return true
                  })
                }
              }}
            >
              <Text fontSize={2} marginBottom={0}>
                {intl.formatMessage({
                  id: 'unfollow',
                })}
              </Text>
            </Menu.Item>
          </Menu.List>
        </Menu>
      </LoginOverlay>
    )
  }

  return null
}

export default OpinionFollowButton
