import {
  Box,
  Button,
  CapUIFontSize,
  CapUIFontWeight,
  CapUIIcon,
  CapUIModalSize,
  CircularStep,
  Flex,
  Heading,
  Icon,
  Modal,
} from '@cap-collectif/ui'
import { FC, useEffect, useMemo, useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import { graphql, useFragment } from 'react-relay'
import { VoteStepUserInfos_proposalStep$key } from '@relay/VoteStepUserInfos_proposalStep.graphql'
import VotesPopup from '@components/FrontOffice/Steps/VoteStep/VotesPopup/VotesPopup'

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
  step: VoteStepUserInfos_proposalStep$key
}

const FRAGMENT = graphql`
  fragment VoteStepUserInfos_proposalStep on ProposalStep {
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

const VoteStepUserInfos: FC<Props> = ({ step: stepKey }) => {
  const step = useFragment(FRAGMENT, stepKey)
  const intl = useIntl()

  const [isVotePopupOpen, setIsVotePopupOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

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
  const descriptionValue = useMemo(() => step.budget ?? proposalProgress, [step.budget, proposalProgress])

  const targetProgress = (100 * proposalProgress) / proposalLimit
  const [animatedProgress, setAnimatedProgress] = useState(targetProgress)
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    const duration = 500
    const startTime = performance.now()
    const startValue = animatedProgress

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const currentValue = startValue + (targetProgress - startValue) * easeOut

      setAnimatedProgress(currentValue)

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [targetProgress])

  return (
    <Box
      boxShadow="medium"
      backgroundColor="white"
      borderRadius="xs"
      position={isVotePopupOpen ? 'absolute' : 'relative'}
      padding="md"
      width="100%"
      maxHeight="100vh"
    >
      <Flex gap="md" alignItems="center">
        <CircularStep icon={CapUIIcon.ThumbUp} progress={animatedProgress} variantSize="medium" />
        <Box color="text.primary" fontSize={CapUIFontSize.BodyLarge} flex="1">
          <Box fontWeight={CapUIFontWeight.Semibold}>
            {intl.formatMessage({ id: `proposal.step.user.votes.infos.title.${titleKey()}` }, { n: titleValue() })}
          </Box>
          {descriptionValue !== 0 && type === 'simple' && (
            <Box as="p">
              {intl.formatMessage(
                { id: `proposal.step.user.votes.infos.desc.${descriptionKey()}` },
                { n: descriptionValue },
              )}
            </Box>
          )}
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
          <VotesPopup step={step} />
        </Box>
      )}
      <Box alignSelf="flex-start" position="absolute" top="9px" right="7px">
        <Button variant="tertiary" variantSize="small" onClick={() => setIsModalOpen(true)}>
          <Icon name={CapUIIcon.Info} color="primary.base" />
        </Button>
        <Modal
          show={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          hideCloseButton={false}
          size={CapUIModalSize.Md}
          ariaLabel={intl.formatMessage({ id: 'front.proposal.votes-popup.help' })}
        >
          <Modal.Header>
            <Heading>{intl.formatMessage({ id: 'front.proposal.votes-popup.help' })}</Heading>
          </Modal.Header>
          <Modal.Body>{step.votesHelpText}</Modal.Body>
          <Modal.Footer>
            <Button onClick={() => setIsModalOpen(false)}>{intl.formatMessage({ id: 'global.close' })}</Button>
          </Modal.Footer>
        </Modal>
      </Box>
    </Box>
  )
}
export default VoteStepUserInfos
