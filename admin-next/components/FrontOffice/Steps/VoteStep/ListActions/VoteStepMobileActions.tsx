import { Box, CapUIIcon, Flex } from '@cap-collectif/ui'
import { VoteStepMobileActions_proposalStep$key } from '@relay/VoteStepMobileActions_proposalStep.graphql'
import { parseAsInteger, useQueryState } from 'nuqs'
import { useState } from 'react'
import { useIntl } from 'react-intl'
import { graphql, useFragment } from 'react-relay'
import VoteStepMobileFiltersModal from '../Filters/VoteStepMobileFiltersModal'
import ProposalFormModal from '../ProposalForm/ProposalFormModal'
import VoteStepMobileVotesModal from '../VotesPopup/VoteStepMobileVotesModal'
import StepVoteMobileActionBtn from './VoteStepMobileActionBtn'

type ActiveAction = 'search' | 'collect' | 'vote' | 'map' | null

interface Props {
  step: VoteStepMobileActions_proposalStep$key
}

const FRAGMENT = graphql`
  fragment VoteStepMobileActions_proposalStep on ProposalStep {
    id
    __typename
    votable
    allProposals: proposals {
      totalCount
    }
    form {
      isMapViewEnabled
      isGridViewEnabled
      isListViewEnabled
      contribuable
      ...ProposalFormModal_proposalForm
    }
    ...VoteStepMobileVotesModal_proposalStep
  }
`

const StepVoteMobileActions: React.FC<Props> = ({ step: stepKey }) => {
  const intl = useIntl()
  const step = useFragment(FRAGMENT, stepKey)
  const isCollectStep = step.__typename === 'CollectStep'
  const [activeAction, setActiveAction] = useState<ActiveAction>(null)

  // Mobile: map hidden by default, shown when map_shown=1
  const [isMapShown, setIsMapShown] = useQueryState('map_shown', parseAsInteger)
  const isMapVisible = isMapShown === 1

  const handleActionClick = (action: ActiveAction) => {
    if (action === 'map') {
      setIsMapShown(isMapVisible ? null : 1)
    }
    if (action == 'vote') {
      setActiveAction(prev => (prev === action ? null : action))
    } else {
      setActiveAction(null)
    }
  }

  return (
    <Box position="fixed" zIndex={2000} bottom={0} left={0} width="100%" backgroundColor="white" px="xs" py="sm">
      <Flex width="100%">
        <VoteStepMobileFiltersModal
          stepId={step.id}
          proposalsCount={step.allProposals?.totalCount ?? 0}
          isActive={activeAction === 'search'}
          onButtonClick={() => handleActionClick('search')}
        />
        {step.form && isCollectStep && (
          <ProposalFormModal
            mode="create"
            disabled={!step.form.contribuable}
            proposalForm={step.form}
            stepId={step.id}
            onButtonClick={() => handleActionClick('collect')}
          />
        )}
        {step.votable && (
          <VoteStepMobileVotesModal
            step={step}
            isActive={activeAction === 'vote'}
            onButtonClick={() => handleActionClick('vote')}
          />
        )}
        {step.form.isMapViewEnabled &&
          (step.form.isGridViewEnabled !== false || step.form.isListViewEnabled !== false) && (
            <StepVoteMobileActionBtn
              icon={isMapVisible ? CapUIIcon.Grid : CapUIIcon.PinO}
              onClick={() => handleActionClick('map')}
            >
              {isMapVisible
                ? intl.formatMessage({ id: 'step.vote.list_actions.thumbnails' })
                : intl.formatMessage({ id: 'global.card' })}
            </StepVoteMobileActionBtn>
          )}
      </Flex>
    </Box>
  )
}

export default StepVoteMobileActions
