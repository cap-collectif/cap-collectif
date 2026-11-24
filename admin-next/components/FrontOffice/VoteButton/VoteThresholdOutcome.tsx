import {
  Box,
  CapUIFontSize,
  CapUIFontWeight,
  CapUIIcon,
  CapUIIconSize,
  CapUILineHeight,
  Flex,
  Icon,
  Text,
} from '@cap-collectif/ui'
import { VoteAction } from '@shared/utils/getVoteAction'
import * as React from 'react'
import { useIntl } from 'react-intl'

type Props = {
  votesCount: number
  voteThreshold: number
  voteAction: VoteAction
}

/**
 * Outcome sentence shown on a proposal card once the proposal can no longer be voted for
 * in a step with a vote threshold: "Seuil atteint · 198 230 signatures" or "Seuil non atteint · 15 470 signatures".
 * The two outcomes differ by their icon, not only by their color.
 */
export const VoteThresholdOutcome: React.FC<Props> = ({ votesCount, voteThreshold, voteAction }) => {
  const intl = useIntl()
  const isReached = votesCount >= voteThreshold
  const color = isReached ? 'green.700' : 'neutral-gray.700'

  return (
    <Flex
      className="vote-threshold-outcome"
      align="center"
      gap="xxs"
      width="100%"
      minWidth={0}
      // Reserves the room of the gauge bar (4px margin + 4px bar) so this line sits at the height of the gauge counter
      pb="xs"
    >
      <Icon
        name={isReached ? CapUIIcon.Check : CapUIIcon.Cross}
        size={CapUIIconSize.Md}
        color={color}
        aria-hidden="true"
        flexShrink={0}
        // Compensates the built-in padding of the icon so the glyph lines up with the card texts
        ml="-5px"
      />
      <Text
        fontSize={CapUIFontSize.BodyRegular}
        lineHeight={CapUILineHeight.M}
        whiteSpace="nowrap"
        overflow="hidden"
        textOverflow="ellipsis"
      >
        <Box as="span" color={color} fontWeight={CapUIFontWeight.Semibold}>
          {isReached
            ? intl.formatMessage({ id: 'front.proposal.vote-threshold.reached', defaultMessage: 'Seuil atteint' })
            : intl.formatMessage({
                id: 'front.proposal.vote-threshold.not-reached',
                defaultMessage: 'Seuil non atteint',
              })}
        </Box>
        <Box as="span" color="neutral-gray.700">
          {' · '}
          {intl.formatMessage(
            {
              id: 'front.proposal.vote-threshold.count',
              defaultMessage:
                '{voteAction, select, SUPPORT {{count, plural, one {{formattedCount} soutien} other {{formattedCount} soutiens}}} SIGN {{count, plural, one {{formattedCount} signature} other {{formattedCount} signatures}}} other {{count, plural, one {{formattedCount} vote} other {{formattedCount} votes}}}}',
            },
            // Numbers are formatted here so they follow the platform locale even when the message falls back
            { voteAction, count: votesCount, formattedCount: intl.formatNumber(votesCount) },
          )}
        </Box>
      </Text>
    </Flex>
  )
}

export default VoteThresholdOutcome
