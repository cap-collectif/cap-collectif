import {
  Box,
  Button,
  CapUIFontSize,
  CapUIFontWeight,
  CapUIIcon,
  CircularStep,
  Flex,
  Icon,
  Tooltip,
} from '@cap-collectif/ui'
import { FC, useState } from 'react'
import { useIntl } from 'react-intl'
import { graphql, useFragment } from 'react-relay'
import { StepUserVotesInfos_proposalStep$key } from '@relay/StepUserVotesInfos_proposalStep.graphql'
import VoteStepUserVotesPopup from '@components/FrontOffice/Steps/VoteStep/VotesPopup/VotesPopup'

const contentTypes = [
  'minMaxRanking',
  'min',
  'max',
  'budget',
  'budgetMinMax',
  'threshold',
  'simple',
  'maxRanking',
] as const
export type StepUserVotesType = typeof contentTypes[number]

interface Props {
  step: StepUserVotesInfos_proposalStep$key
}

const FRAGMENT = graphql`
  fragment StepUserVotesInfos_proposalStep on ProposalStep {
    ...VotesPopup_proposalStep
    voteType
    budget
    votesLimit
    votesMin
    votesHelpText
    viewerVotes {
      totalCount
    }
  }
`

const StepUserVotesInfos: FC<Props> = ({ step: stepKey }) => {
  const step = useFragment(FRAGMENT, stepKey)
  const intl = useIntl()

  const [isVotePopupOpen, setIsVotePopupOpen] = useState(false)

  const type = (step.voteType?.toLowerCase() as StepUserVotesType) ?? 'simple'
  const proposalProgress = step.viewerVotes?.totalCount ?? 0
  const proposalGoal = step.votesMin
  const proposalMax = step.votesLimit

  const proposalLimit = proposalMax ?? proposalGoal
  const isEnded = proposalProgress === proposalLimit
  const isValidated = proposalProgress === proposalGoal

  const titleBaseKey = () => {
    switch (type) {
      case 'budget':
      case 'threshold':
      case 'simple':
        return 'proposals'
      default:
        return 'proposal-number'
    }
  }
  const titleKey = () => {
    switch (type) {
      case 'min':
        return isValidated ? 'validated' : titleBaseKey()
      case 'max':
      case 'budgetMinMax':
      case 'maxRanking':
        return isEnded ? 'ended' : titleBaseKey()
      case 'minMaxRanking':
        return isEnded ? 'ended' : isValidated ? 'validated' : titleBaseKey()
      default:
        return titleBaseKey()
    }
  }

  const descriptionKey = () => {
    switch (type) {
      case 'minMaxRanking':
      case 'min':
        return 'default'
      case 'budget':
      case 'budgetMinMax':
        return 'budget'
      case 'threshold':
        return 'threshold'
      default:
        return 'votes-validated'
    }
  }

  const buttonKey = () => {
    const rankingTypes: StepUserVotesType[] = ['minMaxRanking', 'maxRanking']
    return rankingTypes.includes(type) ? 'ranking' : 'votes'
  }

  const titleValue = () => (proposalGoal ? proposalGoal - proposalProgress : undefined)
  const descriptionValue = () => step.budget ?? proposalProgress

  const progressValue = () => (100 * proposalProgress) / proposalLimit

  return (
    <Box
      boxShadow={isVotePopupOpen ? 'medium' : 'none'}
      backgroundColor="white"
      borderRadius="xs"
      position={isVotePopupOpen ? 'absolute' : 'relative'}
      padding="md"
      width="100%"
    >
      <Flex gap="md" alignItems="center">
        <CircularStep icon={CapUIIcon.ThumbUp} progress={progressValue()} variantSize="medium" />
        <Box color="text.primary" fontSize={CapUIFontSize.BodyLarge} flex="1">
          <Box fontWeight={CapUIFontWeight.Semibold}>
            {intl.formatMessage({ id: `proposal.step.user.votes.infos.title.${titleKey()}` }, { n: titleValue() })}
          </Box>
          <p>
            {intl.formatMessage(
              { id: `proposal.step.user.votes.infos.desc.${descriptionKey()}` },
              { n: descriptionValue() },
            )}
          </p>
          <Button
            variantSize="small"
            variant="tertiary"
            marginTop="xxs"
            paddingLeft="0"
            rightIcon={isVotePopupOpen ? CapUIIcon.ArrowUpO : CapUIIcon.ArrowDownO}
            onClick={() => setIsVotePopupOpen(!isVotePopupOpen)}
          >
            {intl.formatMessage({ id: `proposal.step.user.votes.infos.btn.${buttonKey()}` })}
          </Button>
        </Box>
      </Flex>
      {isVotePopupOpen && (
        <Box mt="lg">
          <VoteStepUserVotesPopup step={step} />
        </Box>
      )}
      <Box alignSelf="flex-start" position="absolute" top="9px" right="7px">
        <Tooltip label={step.votesHelpText}>
          <Icon name={CapUIIcon.Info} color="primary.base" />
        </Tooltip>
      </Box>
    </Box>
  )
}
export default StepUserVotesInfos
