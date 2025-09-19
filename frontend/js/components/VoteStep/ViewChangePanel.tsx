import { CapUIIcon, CapUIIconSize, Flex, Icon, Text, Box, useTheme, CapUIFontSize } from '@cap-collectif/ui'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { useEventListener } from '@shared/hooks/useEventListener'
import { VoteStepEvent, View, dispatchEvent } from './utils'
import { useVoteStepContext } from './Context/VoteStepContext'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import { useWindowWidth } from '~/utils/hooks/useWindowWidth'
import useIsMobile from '~/utils/hooks/useIsMobile'

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
  text: string // 'global.list' | 'global.card' | 'vote_step.all_proposals' translated
  children?: React.ReactNode
  disabled?: boolean
  id?: string
}) => {
  const { view } = useVoteStepContext()
  const intl = useIntl()
  const ariaLabel = text === intl.formatMessage({ id: 'global.list'})
  ? intl.formatMessage({ id: 'front.results.list-view' })
  : text === intl.formatMessage({ id: 'global.card' })
  ? intl.formatMessage({ id: 'front.results.map-view' })
  : text

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
      aria-label={ariaLabel}
      borderColor={active ? 'primary.base' : 'gray.300'}
      aria-current={active}
    >
      <Icon
        name={icon as CapUIIcon}
        size={hideText ? CapUIIconSize.Lg : CapUIIconSize.Md}
        color={active ? 'primary.base' : 'gray.700'}
        opacity={rest.disabled ? '.5' : '1'}
        mr={[0, 0, 0, 1]}
        aria-hidden
        focusable={false}
      />
      {!hideText ? (
        <Text
          opacity={rest.disabled ? '.5' : '1'}
          as="span"
          fontSize={CapUIFontSize.BodyRegular}
          color={active ? 'primary.base' : 'gray.700'}
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
  hasVotesView = true,
  disableMapView,
}: {
  hideText?: boolean
  hasMapView?: boolean
  hasVotesView?: boolean
  disableMapView?: boolean
}) => {
  const intl = useIntl()
  const [hasNewVote, setHasNewVote] = React.useState(false)
  const { view, setView, setFilters } = useVoteStepContext()
  const isCompleteView = useFeatureFlag('full_proposal_card')
  const { colors } = useTheme()
  const { width } = useWindowWidth()
  const isMobile = useIsMobile()
  useEventListener(VoteStepEvent.AddVote, () => setHasNewVote(true))

  React.useEffect(() => {
    if (width >= 1920 && hasMapView && view === View.List) setView(View.Map)
    if (disableMapView) {
      setView(View.List)
    }
  }, [hasMapView, setView, view, width, disableMapView])

  return (
    <Flex
      position="relative"
      flex="none"
      mt={0}
      zIndex={2}
      borderRadius="normal"
      boxShadow={hideText ? 'small' : 'unset'}
      id="view-change-panel"
    >
      <ViewButton
        hideText={hideText || (disableMapView && !isMobile)}
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
        borderTopRightRadius={(!hasMapView || disableMapView) && !hasVotesView ? 'normal' : ''}
        borderBottomRightRadius={(!hasMapView || disableMapView) && !hasVotesView ? 'normal' : ''}
        borderRight={(width >= 1920 && view !== View.Votes) || (view === View.List && !hideText) ? 'normal' : 'none'}
        text={intl.formatMessage({
          id: width >= 1920 ? 'vote_step.all_proposals' : 'global.list',
        })}
        id="change-to-list-view"
      />

      {hasMapView && width < 1920 && !disableMapView ? (
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
            hideText={hideText}
            onClick={() => {
              setHasNewVote(false)
              setView(View.Votes)
            }}
            active={view === View.Votes}
            icon={isCompleteView ? CapUIIcon.Vote : CapUIIcon.ThumbUp}
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
