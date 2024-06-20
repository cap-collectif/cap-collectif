import * as React from 'react'
import { Box, CapUIFontWeight, Flex, Text, Tooltip } from '@cap-collectif/ui'
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
}

const VoteButtonUI = ({
  onClick,
  hasVoted,
  disabled,
  totalCount,
  id,
  noOverlay = false,
  paperVotesTotalCount,
}: Props) => {
  const isAuthenticated = useSelector((state: GlobalState) => state.user.user) !== null
  const intl = useIntl()

  const getPaperVotesCount = children => {
    if (totalCount)
      return (
        <Tooltip
          label={
            <Box fontSize={1} textAlign="center" p={1}>
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
        <DSVoteButton active={hasVoted} id={id} onClick={onClick} disabled={disabled}>
          <Flex direction="column" align="flex-start">
            <Text fontWeight={CapUIFontWeight.Semibold}>{totalCount}</Text>
          </Flex>
        </DSVoteButton>
      </LoginOverlay>
    </div>,
  )
}

export default VoteButtonUI
