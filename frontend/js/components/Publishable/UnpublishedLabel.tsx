import * as React from 'react'
import { graphql, useFragment } from 'react-relay'
import { useSelector } from 'react-redux'
import { FormattedMessage, useIntl } from 'react-intl'
import moment from 'moment'
import { Label } from 'react-bootstrap'
import { CapUIFontSize, Flex, Popover, Text } from '@cap-collectif/ui'

import styled from 'styled-components'
import type { UnpublishedLabel_publishable$key } from '~relay/UnpublishedLabel_publishable.graphql'

type Props = {
  publishable: UnpublishedLabel_publishable$key
}
const FRAGMENT = graphql`
  fragment UnpublishedLabel_publishable on Publishable {
    id
    published
    notPublishedReason
    publishableUntil
  }
`
const StyledPopover = styled(Popover)`
  button {
    background-color: transparent !important;
    border: none !important;
  }
`

const UnpublishedLabel = ({ publishable: publishableRef }: Props) => {
  const publishable = useFragment(FRAGMENT, publishableRef)
  const intl = useIntl()
  const viewer: {
    email: string
  } = useSelector(state => state.user.user)

  if (publishable.published) {
    return null
  }

  let popoverContent = null

  if (publishable.notPublishedReason === 'WAITING_AUTHOR_CONFIRMATION') {
    popoverContent = (
      <>
        <Popover.Header>
          <Text fontSize={CapUIFontSize.BodyRegular} fontWeight="bold" className="excerpt_dark">
            {intl.formatMessage({
              id: 'account-pending-confirmation',
            })}
          </Text>
        </Popover.Header>
        <Popover.Body marginBottom={0}>
          <Text fontSize={CapUIFontSize.BodyRegular}>
            {intl.formatMessage(
              {
                id: 'account-pending-confirmation-message',
              },
              {
                contentType: 'contribution',
                emailAddress: viewer.email,
              },
            )}
          </Text>
          {publishable.publishableUntil && (
            <Text fontSize={CapUIFontSize.BodyRegular} fontWeight="bold">
              {intl.formatMessage(
                {
                  id: 'remaining-time',
                },
                {
                  remainingTime: moment(publishable.publishableUntil).toNow(true),
                  contentType: 'contribution',
                },
              )}{' '}
            </Text>
          )}
        </Popover.Body>
      </>
    )
  }

  if (publishable.notPublishedReason === 'AUTHOR_NOT_CONFIRMED') {
    popoverContent = (
      <>
        <Popover.Header>
          <Text fontSize={CapUIFontSize.BodyRegular} fontWeight="bold" className="excerpt_dark">
            {intl.formatMessage({
              id: 'account-not-confirmed-in-time',
            })}
          </Text>
        </Popover.Header>
        <Popover.Body marginBottom={0}>
          <Text fontSize={CapUIFontSize.BodyRegular}>
            {intl.formatMessage(
              {
                id: 'account-not-confirmed-in-time-message',
              },
              {
                contentType: 'contribution',
              },
            )}
          </Text>
        </Popover.Body>
      </>
    )
  }

  if (publishable.notPublishedReason === 'AUTHOR_CONFIRMED_TOO_LATE') {
    popoverContent = (
      <>
        <Popover.Header>
          <Text fontSize={CapUIFontSize.BodyRegular} fontWeight="bold" className="excerpt_dark">
            {intl.formatMessage({
              id: 'account-confirmed-too-late',
            })}
          </Text>
        </Popover.Header>
        <Popover.Body marginBottom={0}>
          <Text fontSize={CapUIFontSize.BodyRegular}>
            {intl.formatMessage(
              {
                id: 'account-confirmed-too-late-message',
              },
              {
                contentType: 'contribution',
              },
            )}
          </Text>
        </Popover.Body>
      </>
    )
  }

  if (popoverContent) {
    return (
      <StyledPopover
        placement="top"
        options={{
          modal: true,
        }}
        popoverProps={{
          preventBodyScroll: false,
        }}
        baseId={`publishable-${publishable.id}-not-accounted-popover`}
        disclosure={
          <Flex width="fit-content">
            <Label bsStyle="danger" bsSize="xs" className="ellipsis">
              <i className="cap cap-delete-2" />
              <FormattedMessage
                id={
                  publishable.notPublishedReason === 'WAITING_AUTHOR_CONFIRMATION'
                    ? 'awaiting-publication'
                    : 'not-accounted'
                }
              />
            </Label>
          </Flex>
        }
      >
        {popoverContent}
      </StyledPopover>
    )
  }

  return (
    <Flex width="fit-content">
      <Label bsStyle="danger" bsSize="xs" className="ellipsis">
        <i className="cap cap-delete-2" />
        <FormattedMessage
          id={
            publishable.notPublishedReason === 'WAITING_AUTHOR_CONFIRMATION' ? 'awaiting-publication' : 'not-accounted'
          }
        />
      </Label>
    </Flex>
  )
}

export default UnpublishedLabel
