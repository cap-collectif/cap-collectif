import { Box, CapUIIcon, Flex } from '@cap-collectif/ui'
import { VoteStepMobileActions_proposalStep$key } from '@relay/VoteStepMobileActions_proposalStep.graphql'
import { parseAsInteger, useQueryState } from 'nuqs'
import { useState } from 'react'
import { useIntl } from 'react-intl'
import { graphql, useFragment } from 'react-relay'
import VoteStepMobileFiltersModal from '../Filters/VoteStepMobileFiltersModal'
import StepVoteMobileActionBtn from './VoteStepMobileActionBtn'

type ActiveAction = 'search' | 'collect' | 'vote' | 'map' | null

interface Props {
  step: VoteStepMobileActions_proposalStep$key
}

const FRAGMENT = graphql`
  fragment VoteStepMobileActions_proposalStep on ProposalStep {
    id
    votable
    form {
      isMapViewEnabled
    }
  }
`

const StepVoteMobileActions: React.FC<Props> = ({ step: stepKey }) => {
  const intl = useIntl()
  const step = useFragment(FRAGMENT, stepKey)
  const [activeAction, setActiveAction] = useState<ActiveAction>(null)

  const [isMapShown, setIsMapShown] = useQueryState('map_shown', parseAsInteger)

  const handleActionClick = (action: ActiveAction) => {
    if (action === 'map') {
      setIsMapShown(isMapShown === 1 ? 0 : 1)
    }
    setActiveAction(prev => (prev === action ? null : action))
  }

  return (
    <Box position="sticky" zIndex={1} bottom={0} left={0} width="100%" backgroundColor="white" px="xs" py="sm">
      <Flex width="100%">
        <VoteStepMobileFiltersModal
          stepId={step.id}
          isActive={activeAction === 'search'}
          onButtonClick={() => handleActionClick('search')}
        />
        <StepVoteMobileActionBtn
          icon={CapUIIcon.Add}
          isActive={activeAction === 'collect'}
          onClick={() => handleActionClick('collect')}
        >
          {intl.formatMessage({ id: 'global.collect' })}
        </StepVoteMobileActionBtn>
        {step.votable && (
          <StepVoteMobileActionBtn
            icon={CapUIIcon.ThumbUpO}
            isActive={activeAction === 'vote'}
            onClick={() => handleActionClick('vote')}
          >
            {intl.formatMessage({ id: 'global.vote' })}
          </StepVoteMobileActionBtn>
        )}
        {step.form.isMapViewEnabled && (
          <StepVoteMobileActionBtn
            icon={isMapShown ? CapUIIcon.PinO : CapUIIcon.Grid}
            onClick={() => handleActionClick('map')}
          >
            {isMapShown
              ? intl.formatMessage({ id: 'step.vote.list_actions.thumbnails' })
              : intl.formatMessage({ id: 'global.card' })}
          </StepVoteMobileActionBtn>
        )}
      </Flex>
    </Box>
  )
}

export default StepVoteMobileActions
