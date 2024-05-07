import { CapUIIcon, CapUIIconSize, Flex, Icon, Text, Box, useTheme } from '@cap-collectif/ui'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { useSelector } from 'react-redux'
import { useEventListener } from '~/utils/hooks/useEventListener'
import type { GlobalState } from '~/types'
import { VoteStepEvent, View, dispatchEvent } from './utils'
import { useVoteStepContext } from './Context/VoteStepContext'
import useFeatureFlag from '~/utils/hooks/useFeatureFlag'
import { useWindowWidth } from '~/utils/hooks/useWindowWidth'

const ViewButton = ({
  icon,
  active,
  onClick,
  hideText,
  text,
  children,
  ...rest
}: {
  icon: string
  onClick: () => void
  active: boolean
  hideText: boolean
  borderTopLeftRadius?: string
  borderBottomLeftRadius?: string
  borderTopRightRadius?: string
  borderBottomRightRadius?: string
  borderRight?: string
  borderLeft?: string
  text: string
  children?: React.ReactNode
  disabled?: boolean
  id?: string
}) => {
  const { view } = useVoteStepContext()
  return (
    <Flex
      as="button"
      bg="white"
      px={2}
      py={[2, 1]}
      justify="center"
      alignItems="center"
      onClick={onClick}
      border={hideText ? 'none' : 'normal'}
      position="relative"
      {...rest}
      aria-label={text}
      borderColor={active ? 'primary.500' : 'gray.300'}
    >
      <Icon
        name={icon as CapUIIcon}
        size={hideText ? CapUIIconSize.Lg : CapUIIconSize.Md}
        color={active ? 'primary.500' : 'gray.700'}
        opacity={rest.disabled ? '.5' : '1'}
        mr={[0, 0, 0, 1]}
      />
      {!hideText ? (
        <Text
          opacity={rest.disabled ? '.5' : '1'}
          as="span"
          fontSize={3}
          color={active ? 'primary.500' : 'gray.700'}
          display={view === View.Map ? ['none', 'none', 'inline', 'inline'] : 'inline'}
        >
          {text}
        </Text>
      ) : null}
      {children}
    </Flex>
  )
}

export const ViewChangePanel = ({
  hideText = false,
  hasMapView = true,
  isProposalSmsVoteEnabled = false,
  hasVotesView = true,
}: {
  hideText?: boolean
  hasMapView?: boolean
  isProposalSmsVoteEnabled?: boolean
  hasVotesView?: boolean
}) => {
  const intl = useIntl()
  const [hasNewVote, setHasNewVote] = React.useState(false)
  const { user } = useSelector((state: GlobalState) => state.user)
  const { view, setView, setFilters } = useVoteStepContext()
  const isTwilioFeatureEnabled = useFeatureFlag('twilio')
  const isProposalSmsVoteFeatureEnabled = useFeatureFlag('proposal_sms_vote')
  const smsVoteEnabled = isProposalSmsVoteEnabled && isTwilioFeatureEnabled && isProposalSmsVoteFeatureEnabled
  const { colors } = useTheme()
  const { width } = useWindowWidth()
  useEventListener(VoteStepEvent.AddVote, () => setHasNewVote(true))

  React.useEffect(() => {
    if (width >= 1920 && hasMapView && view === View.List) setView(View.Map)
  }, [hasMapView, setView, view, width])

  return (
    <Flex
      position="relative"
      flex="none"
      mt={0}
      zIndex={2}
      borderRadius="normal"
      overflow="hidden"
      boxShadow={hideText ? 'small' : 'unset'}
      id="view-change-panel"
    >
      <ViewButton
        hideText={hideText}
        onClick={() => {
          setView(width >= 1920 && hasMapView ? View.Map : View.List)
          dispatchEvent(VoteStepEvent.ClickProposal, {
            id: null,
          })
        }}
        active={width >= 1920 ? view !== View.Votes : view === View.List}
        icon={CapUIIcon.List}
        borderTopLeftRadius="normal"
        borderBottomLeftRadius="normal"
        borderTopRightRadius={!hasMapView && !hasVotesView ? 'normal' : ''}
        borderBottomRightRadius={!hasMapView && !hasVotesView ? 'normal' : ''}
        borderRight={(width >= 1920 && view !== View.Votes) || (view === View.List && !hideText) ? 'normal' : 'none'}
        text={intl.formatMessage({
          id: width >= 1920 ? 'vote_step.all_proposals' : 'global.list',
        })}
        id="change-to-list-view"
      />

      {hasMapView && width < 1920 ? (
        <>
          <Box
            display={['none', 'none', 'none', 'block']}
            borderColor={`${colors.gray[300]} !important`}
            bg="white"
            width={2}
            borderTop="normal"
            borderBottom="normal"
          />
          <ViewButton
            hideText={hideText}
            onClick={() => {
              setView(View.Map)

              if (hideText) {
                setFilters('term', '')
              }
            }}
            active={view === View.Map}
            icon={CapUIIcon.Pin}
            borderRight={(view === View.Map || !hasVotesView) && !hideText ? 'normal' : 'none'}
            borderLeft={view === View.Map && !hideText ? 'normal' : 'none'}
            borderTopRightRadius={!hasVotesView ? 'normal' : ''}
            borderBottomRightRadius={!hasVotesView ? 'normal' : ''}
            text={intl.formatMessage({
              id: 'global.card',
            })}
            id="change-to-map-view"
          />
        </>
      ) : null}
      {hasVotesView ? (
        <>
          <Box
            display={['none', 'none', 'none', 'block']}
            borderColor={`${colors.gray[300]} !important`}
            bg="white"
            width={2}
            borderTop="normal"
            borderBottom="normal"
          />
          <ViewButton
            disabled={!user && !smsVoteEnabled}
            hideText={hideText}
            onClick={() => {
              setHasNewVote(false)
              setView(View.Votes)
            }}
            active={view === View.Votes}
            icon={CapUIIcon.ThumbUp}
            borderTopRightRadius="normal"
            borderBottomRightRadius="normal"
            borderLeft={view === View.Votes && !hideText ? 'normal' : 'none'}
            text={intl.formatMessage({
              id: 'project.votes.title',
            })}
            id="change-to-votes-view"
          >
            {hasNewVote ? (
              <Box
                bg="white"
                border="normal"
                borderColor="white"
                height={[3, 2]}
                width={[3, 2]}
                position="absolute"
                top={2}
                left={[7, '1.5rem']}
              >
                <Box bg="red.500" borderRadius="100%" height="100%" width="100%" />
              </Box>
            ) : null}
          </ViewButton>
        </>
      ) : null}
    </Flex>
  )
}
export default ViewChangePanel
