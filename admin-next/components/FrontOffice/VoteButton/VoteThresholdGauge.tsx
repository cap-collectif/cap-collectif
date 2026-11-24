import { Box, CapUIFontSize, CapUIFontWeight, CapUILineHeight, Text, Tooltip } from '@cap-collectif/ui'
import { VoteAction } from '@shared/utils/getVoteAction'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { getThresholdProgress, THRESHOLD_GAUGE_MIN_FILL_WIDTH } from './voteThreshold.utils'

type Props = {
  votesCount: number
  voteThreshold: number
  voteAction: VoteAction
  tooltipLabel?: React.ReactNode
}

/**
 * Counter ("15 470 / 150 000 signatures") and progress bar shown on a proposal card
 * while the proposal can still be voted for in a step with a vote threshold.
 */
export const VoteThresholdGauge: React.FC<Props> = ({ votesCount, voteThreshold, voteAction, tooltipLabel }) => {
  const intl = useIntl()
  const progress = getThresholdProgress(votesCount, voteThreshold)

  const counter = (
    <Text
      className="vote-threshold-counter"
      fontSize={CapUIFontSize.BodyRegular}
      lineHeight={CapUILineHeight.M}
      whiteSpace="nowrap"
      overflow="hidden"
      textOverflow="ellipsis"
    >
      <Box as="span" color="primary.base" fontWeight={CapUIFontWeight.Semibold}>
        {intl.formatNumber(votesCount)}
      </Box>
      <Box as="span" color="neutral-gray.700">
        {' / '}
        {intl.formatNumber(voteThreshold)}{' '}
        {intl.formatMessage(
          {
            id: 'front.proposal.vote-threshold.unit',
            defaultMessage:
              '{voteAction, select, SUPPORT {{threshold, plural, one {soutien} other {soutiens}}} SIGN {{threshold, plural, one {signature} other {signatures}}} other {{threshold, plural, one {vote} other {votes}}}}',
          },
          { voteAction, threshold: voteThreshold },
        )}
      </Box>
    </Text>
  )

  return (
    <Box flex="1 1 0" minWidth={0}>
      {tooltipLabel ? <Tooltip label={tooltipLabel}>{counter}</Tooltip> : counter}
      <Box
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        aria-valuetext={intl.formatMessage(
          {
            id: 'front.proposal.vote-threshold.progress-label',
            defaultMessage:
              '{voteAction, select, SUPPORT {{count, plural, one {{formattedCount} soutien} other {{formattedCount} soutiens}}} SIGN {{count, plural, one {{formattedCount} signature} other {{formattedCount} signatures}}} other {{count, plural, one {{formattedCount} vote} other {{formattedCount} votes}}}} sur {formattedThreshold}',
          },
          // Numbers are formatted here so they follow the platform locale even when the message falls back
          {
            voteAction,
            count: votesCount,
            formattedCount: intl.formatNumber(votesCount),
            formattedThreshold: intl.formatNumber(voteThreshold),
          },
        )}
        height="4px"
        mt="xxs"
        borderRadius="xxs"
        overflow="hidden"
        backgroundColor="primary.lighter"
      >
        <Box
          className="vote-threshold-fill"
          height="100%"
          borderRadius="xxs"
          backgroundColor="primary.base"
          style={{
            width: `${progress}%`,
            minWidth: votesCount > 0 ? THRESHOLD_GAUGE_MIN_FILL_WIDTH : 0,
          }}
          sx={{
            transition: 'width 0.4s ease',
            '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
          }}
        />
      </Box>
    </Box>
  )
}

export default VoteThresholdGauge
