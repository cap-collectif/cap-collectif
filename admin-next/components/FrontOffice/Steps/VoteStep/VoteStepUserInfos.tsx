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
  useTheme,
} from '@cap-collectif/ui'
import { FC, useState } from 'react'
import { useIntl } from 'react-intl'
import { graphql, useFragment } from 'react-relay'
import { VoteStepUserInfos_proposalStep$key } from '@relay/VoteStepUserInfos_proposalStep.graphql'
import VotesPopup from '@components/FrontOffice/Steps/VoteStep/VotesPopup/VotesPopup'
import WYSIWYGRender from '@shared/form/WYSIWYGRender'
import useIsMobile from '@shared/hooks/useIsMobile'

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
  const { colors } = useTheme()

  const [isVotePopupOpen, setIsVotePopupOpen] = useState(false)

  // Fallback to 'simple' but has to be changed later with the real step type
  const type = (step.voteType?.toLowerCase() as StepUserVotesType) ?? 'simple'

  const currentBudget = step.viewerVotes.edges.reduce((acc, edge) => acc + edge.node.proposal.estimation, 0)
  const proposalProgress = type == 'budget' ? currentBudget : step.viewerVotes?.totalCount ?? 0
  const proposalGoal = step.votesMin
  const proposalMax = step.votesLimit

  const proposalLimit = type == 'budget' ? step.budget : proposalMax ?? proposalGoal
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
  const descriptionValue = () => (step.budget !== null ? proposalLimit - currentBudget : proposalProgress)

  const progress = (100 * proposalProgress) / proposalLimit

  return (
    <Box
      boxShadow={isMobile ? 'none' : 'medium'}
      backgroundColor="white"
      borderRadius="xs"
      position={isVotePopupOpen ? 'absolute' : 'relative'}
      padding="md"
      width="100%"
      maxHeight="100vh"
      zIndex={1}
    >
      <Flex gap="md" alignItems="center">
        <CircularStep icon={CapUIIcon.ThumbUp} progress={progress} variantSize="medium" />
        <Box color="text.primary" fontSize={CapUIFontSize.BodyLarge} flex="1">
          <Box fontWeight={CapUIFontWeight.Semibold}>
            {intl.formatMessage({ id: `proposal.step.user.votes.infos.title.${titleKey()}` }, { n: titleValue() })}
          </Box>
          {descriptionValue() !== 0 && (
            <Box as="p">
              {intl.formatMessage(
                { id: `proposal.step.user.votes.infos.desc.${descriptionKey()}` },
                { n: descriptionValue() },
              )}
            </Box>
          )}
          {!isMobile ? (
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
          ) : null}
        </Box>
      </Flex>
      {isVotePopupOpen && (
        <Box mt="lg">
          <VotesPopup step={step} />
        </Box>
      )}
      {step.votesHelpText ? (
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
      ) : null}
    </Box>
  )
}
export default VoteStepUserInfos
