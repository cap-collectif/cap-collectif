import {
  Box,
  Button,
  CapUIFontSize,
  CapUIFontWeight,
  CapUIIcon,
  CapUIIconSize,
  CapUIModalSize,
  CircularStep,
  Flex,
  Heading,
  Icon,
  Modal,
  useTheme,
} from '@cap-collectif/ui'
import { FC, useState } from 'react'
import { useIntl } from 'react-intl'
import { graphql, useFragment } from 'react-relay'
import {
  ProposalStepVoteTypeValue,
  VoteStepUserInfos_proposalStep$key,
} from '@relay/VoteStepUserInfos_proposalStep.graphql'
import VotesPopup from '@components/FrontOffice/Steps/VoteStep/VotesPopup/VotesPopup'
import WYSIWYGRender from '@shared/form/WYSIWYGRender'
import useIsMobile from '@shared/hooks/useIsMobile'
import { useMatchMedia } from '@liinkiing/react-hooks'

export type StepUserVotesType =
  | 'minMaxRanking'
  | 'minMax'
  | 'min'
  | 'max'
  | 'budget'
  | 'budgetMinMax'
  | 'threshold'
  | 'simple'
  | 'maxRanking'

const deriveTypeFromVoteTypes = (voteTypes: ReadonlyArray<ProposalStepVoteTypeValue>): StepUserVotesType => {
  const has = (v: ProposalStepVoteTypeValue) => voteTypes.includes(v)
  if (has('RANKING')) return has('MIN') && has('MAX') ? 'minMaxRanking' : 'maxRanking'
  if (has('BUDGET')) return has('MIN') || has('MAX') ? 'budgetMinMax' : 'budget'
  if (has('MIN') && has('MAX')) return 'minMax'
  if (has('MIN')) return 'min'
  if (has('MAX')) return 'max'
  if (has('THRESHOLD')) return 'threshold'
  return 'simple'
}

type TitleKey = 'proposals' | 'proposal-number' | 'validated' | 'ended'
// Keys for new translations: 'vote-more', 'vote-others', 'thanks', 'budget-ended'
type DescKey =
  | 'default'
  | 'budget'
  | 'budget-ended'
  | 'threshold'
  | 'votes-validated'
  | 'vote-more'
  | 'vote-others'
  | 'thanks'

type VoteTypeConfig = {
  buttonKey: 'ranking' | 'votes'
  showCircularProgress: boolean
  getTitleKey: (isEnded: boolean, isValidated: boolean) => TitleKey
  // Returns null when no description should be shown
  getDescKey: (isEnded: boolean, isValidated: boolean, voteProgress: number) => DescKey | null
}

const VOTE_TYPE_CONFIG: Record<StepUserVotesType, VoteTypeConfig> = {
  simple: {
    buttonKey: 'votes',
    showCircularProgress: false,
    getTitleKey: () => 'proposals',
    getDescKey: (_, __, p) => (p > 0 ? 'votes-validated' : null),
  },
  threshold: {
    buttonKey: 'votes',
    showCircularProgress: false,
    getTitleKey: () => 'proposals',
    getDescKey: () => 'threshold',
  },
  budget: {
    buttonKey: 'votes',
    showCircularProgress: true,
    getTitleKey: () => 'proposals',
    getDescKey: () => 'budget',
  },
  min: {
    buttonKey: 'votes',
    showCircularProgress: true,
    getTitleKey: (_, v) => (v ? 'validated' : 'proposal-number'),
    getDescKey: (_, v) => (v ? 'vote-others' : 'default'),
  },
  max: {
    buttonKey: 'votes',
    showCircularProgress: true,
    getTitleKey: e => (e ? 'ended' : 'proposal-number'),
    getDescKey: (e, _, p) => (e ? 'thanks' : p > 0 ? 'votes-validated' : null),
  },
  budgetMinMax: {
    buttonKey: 'votes',
    showCircularProgress: true,
    getTitleKey: (e, v) => (e ? 'ended' : v ? 'validated' : 'proposal-number'),
    getDescKey: (_, v) => (v ? 'budget-ended' : 'budget'),
  },
  minMax: {
    buttonKey: 'votes',
    showCircularProgress: true,
    getTitleKey: (e, v) => (e ? 'ended' : v ? 'validated' : 'proposal-number'),
    getDescKey: (e, v) => (e ? 'thanks' : v ? 'vote-others' : 'default'),
  },
  maxRanking: {
    buttonKey: 'ranking',
    showCircularProgress: true,
    getTitleKey: e => (e ? 'ended' : 'proposal-number'),
    getDescKey: (e, _, p) => (e ? 'thanks' : p > 0 ? 'votes-validated' : null),
  },
  minMaxRanking: {
    buttonKey: 'ranking',
    showCircularProgress: true,
    getTitleKey: (e, v) => (e ? 'ended' : v ? 'validated' : 'proposal-number'),
    getDescKey: (e, v) => (e ? 'thanks' : v ? 'vote-more' : 'default'),
  },
}

interface Props {
  step: VoteStepUserInfos_proposalStep$key
}

const FRAGMENT = graphql`
  fragment VoteStepUserInfos_proposalStep on ProposalStep {
    ...VotesPopup_proposalStep
    budget
    votesLimit
    votesMin
    votesHelpText
    voteThreshold
    voteTypes
    viewerVotes {
      totalCount
      edges {
        node {
          proposal {
            estimation
          }
        }
      }
    }
  }
`

const VoteStepUserInfos: FC<Props> = ({ step: stepKey }) => {
  const step = useFragment(FRAGMENT, stepKey)
  const intl = useIntl()
  const isMobile = useIsMobile()
  const isTabletOrSmaller = useMatchMedia(`screen and (max-width: 1024px)`)
  const { colors } = useTheme()
  const [isVotePopupOpen, setIsVotePopupOpen] = useState(false)

  const type = deriveTypeFromVoteTypes(step.voteTypes)
  const { buttonKey, showCircularProgress, getTitleKey, getDescKey } = VOTE_TYPE_CONFIG[type]

  const currentBudget = step.viewerVotes.edges.reduce((acc, edge) => acc + edge.node.proposal.estimation, 0)
  const voteProgress = step.viewerVotes.totalCount

  // Circular progress always uses budget for budget-based types
  const isBudgetBased = type === 'budget' || type === 'budgetMinMax'
  const circularProgress = isBudgetBased ? currentBudget : voteProgress
  const circularLimit = isBudgetBased ? step.budget ?? 0 : step.votesLimit ?? step.votesMin ?? 0

  const voteIcon = isBudgetBased ? CapUIIcon.Bag : CapUIIcon.ThumbUp

  // isEnded: budget exhausted for `budget`, proposals maxed out for `budgetMinMax` and others
  const endedProgress = type === 'budget' ? currentBudget : voteProgress
  const endedLimit = type === 'budget' ? step.budget ?? 0 : step.votesLimit ?? step.votesMin ?? 0
  const isEnded = endedLimit > 0 && endedProgress === endedLimit
  const isValidated = step.votesMin !== null && voteProgress >= step.votesMin

  const titleKey = getTitleKey(isEnded, isValidated)
  const descKey = getDescKey(isEnded, isValidated, voteProgress)

  // Remaining votes/budget toward the next milestone, used by `proposal-number` title
  const titleValue = (() => {
    if (type === 'min' || (type === 'minMaxRanking' && !isValidated)) return (step.votesMin ?? 0) - voteProgress
    if (type === 'max' || type === 'maxRanking' || type === 'budgetMinMax') return (step.votesLimit ?? 0) - voteProgress
    return undefined
  })()

  // n value passed to the description translation
  const descriptionValue = (() => {
    switch (descKey) {
      case 'budget':
      case 'budget-ended':
        return (step.budget ?? 0) - currentBudget
      case 'votes-validated':
        return voteProgress
      case 'vote-more':
        return (step.votesLimit ?? 0) - voteProgress
      case 'threshold':
        return step.voteThreshold ?? 0
      default:
        return undefined
    }
  })()

  const progress = circularLimit > 0 ? Math.min(100, (100 * circularProgress) / circularLimit) : 0

  return (
    <Box
      boxShadow={isVotePopupOpen ? 'medium' : 'none'}
      backgroundColor="white"
      borderRadius="xs"
      position={isVotePopupOpen ? 'absolute' : 'relative'}
      padding="md"
      width="100%"
      maxHeight="calc(100vh - 48px)"
      display="flex"
      flexDirection="column"
      gap="lg"
      zIndex={1}
    >
      <Flex gap="md" alignItems="center">
        {showCircularProgress ? (
          <CircularStep icon={voteIcon} progress={progress} variantSize={isTabletOrSmaller ? 'small' : 'medium'} />
        ) : (
          <Icon name={voteIcon} color="primary.base" size={isTabletOrSmaller ? CapUIIconSize.Lg : CapUIIconSize.Xl} />
        )}
        <Box color="text.primary" fontSize={CapUIFontSize.BodyLarge} flex="1">
          <Box fontWeight={CapUIFontWeight.Semibold}>
            {intl.formatMessage({ id: `proposal.step.user.votes.infos.title.${titleKey}` }, { n: titleValue })}
          </Box>
          {descKey && (
            <Box as="p">
              {intl.formatMessage(
                { id: `proposal.step.user.votes.infos.desc.${descKey}` },
                { n: descriptionValue, v: (step.votesLimit ?? 0) - voteProgress },
              )}
            </Box>
          )}
          {!isMobile && (
            <Button
              variantSize="small"
              variant="tertiary"
              marginTop="xxs"
              paddingLeft="0"
              rightIcon={isVotePopupOpen ? CapUIIcon.ArrowUpO : CapUIIcon.ArrowDownO}
              onClick={() => setIsVotePopupOpen(!isVotePopupOpen)}
            >
              {intl.formatMessage({ id: `proposal.step.user.votes.infos.btn.${buttonKey}` })}
            </Button>
          )}
        </Box>
      </Flex>
      {isVotePopupOpen && (
        <Box overflow="auto">
          <VotesPopup step={step} />
        </Box>
      )}
      {step.votesHelpText !== null && step.votesHelpText !== undefined && step.votesHelpText !== '' && (
        <Box alignSelf="flex-start" position="absolute" top={isMobile ? '0px' : '9px'} right={isMobile ? '0px' : '7px'}>
          <Modal
            disclosure={
              <Button variant="tertiary" variantSize="small">
                <Icon name={CapUIIcon.Info} color="primary.base" />
              </Button>
            }
            hideCloseButton={false}
            size={CapUIModalSize.Md}
            ariaLabel={intl.formatMessage({ id: 'front.proposal.votes-popup.help' })}
          >
            {({ hide }) => (
              <>
                <Modal.Header>
                  <Heading as="h2" color={`${colors.text.secondary}!important`}>
                    {/* Needs !important otherwise it's overridden by the default color u_U */}
                    {intl.formatMessage({ id: 'front.proposal.votes-popup.help' })}
                  </Heading>
                </Modal.Header>
                <Modal.Body>
                  <WYSIWYGRender value={step.votesHelpText} />
                </Modal.Body>
                <Modal.Footer>
                  <Button variantSize="big" onClick={hide}>
                    {intl.formatMessage({ id: 'global.close' })}
                  </Button>
                </Modal.Footer>
              </>
            )}
          </Modal>
        </Box>
      )}
    </Box>
  )
}

export default VoteStepUserInfos
