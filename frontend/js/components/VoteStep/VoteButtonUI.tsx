import * as React from 'react'
import { Box, CapUIFontSize, CapUIFontWeight, Flex, Text, Tooltip } from '@cap-collectif/ui'
import { useSelector } from 'react-redux'
import type { GlobalState } from '~/types'
import LoginOverlay from '~/components/Utils/LoginOverlay'
import { VoteButton as DSVoteButton } from '@cap-collectif/ui'
import { useIntl } from 'react-intl'

type Props = {
  hasVoted: boolean
  disabled: boolean
  totalCount: number
  paperVotesTotalCount: number
  onClick: () => void
  id: string
  noOverlay?: boolean
  title?: string
}

const VoteButtonUI = ({
  onClick,
  hasVoted,
  disabled,
  totalCount,
  id,
  noOverlay = false,
  paperVotesTotalCount,
  title,
}: Props) => {
  const isAuthenticated = useSelector((state: GlobalState) => state.user.user) !== null
  const intl = useIntl()

  const getPaperVotesCount = children => {
    if (totalCount)
      return (
        <Tooltip
          label={
            <Box fontSize={CapUIFontSize.Caption} textAlign="center" p={1}>
              {totalCount - paperVotesTotalCount > 0 &&
                intl.formatMessage(
                  {
                    id: 'numeric-votes-count',
                  },
                  {
                    num: totalCount,
                  },
                )}
              {paperVotesTotalCount > 0 && (
                <>
                  <br />
                  {intl.formatMessage(
                    {
                      id: 'paper-votes-count',
                    },
                    {
                      num: paperVotesTotalCount,
                    },
                  )}
                </>
              )}
            </Box>
          }
        >
          {children}
        </Tooltip>
      )
    return children
  }

  return getPaperVotesCount(
    <div>
      <LoginOverlay enabled={!isAuthenticated && !noOverlay}>
        <DSVoteButton
          active={hasVoted}
          id={id}
          onClick={onClick}
          disabled={disabled}
          aria-label={`${
            hasVoted ? intl.formatMessage({ id: 'delete-vote' }) : intl.formatMessage({ id: 'vote.add' })
          } ${intl.formatMessage({ id: 'global.for_entity' }, { entity: title })} - ${intl.formatMessage(
            { id: 'votes_registered' },
            { count: totalCount },
          )}`}
        >
          <Flex direction="column" align="flex-start">
            <Text fontWeight={CapUIFontWeight.Semibold}>{totalCount}</Text>
          </Flex>
        </DSVoteButton>
      </LoginOverlay>
    </div>,
  )
}

export default VoteButtonUI
