import * as React from 'react'
import VoteStepSearchBar from './VoteStepSearchBar'
import { graphql, useFragment } from 'react-relay'
import { VoteStepFiltersWeb_proposalStep$key } from '@relay/VoteStepFiltersWeb_proposalStep.graphql'
import { Box, Button, CapUIIcon, Flex } from '@cap-collectif/ui'
import ProposalForm from '../ProposalForm/ProposalForm'
import { parseAsInteger, useQueryState } from 'nuqs'
import ProposalStepUserVotesInfos from '@shared/proposal/ProposalStepUserVotesInfos'

type Props = {
  step: VoteStepFiltersWeb_proposalStep$key
}

const FRAGMENT = graphql`
  fragment VoteStepFiltersWeb_proposalStep on ProposalStep {
    ...ProposalStepUserVotesInfos_proposalStep
    __typename
    open
    votable
    form {
      isMapViewEnabled
      contribuable
      # ...ProposalCreateModal_proposalForm
    }
  }
`

const VoteStepFiltersWeb: React.FC<Props> = ({ step: stepKey }) => {
  const step = useFragment(FRAGMENT, stepKey)
  const isCollectStep = step.__typename === 'CollectStep'

  const [isMapShown, setIsMapShown] = useQueryState('map_shown', parseAsInteger)
  const [, setIsMapExpanded] = useQueryState('map_expanded', parseAsInteger)
  const hasMapView = step.form?.isMapViewEnabled

  return (
    <Flex gap="lg" width="100%" align="start">
      <Flex gap="xl" width="100%" flex="2 1 0" flexWrap={step.votable ? 'wrap' : 'nowrap'}>
        <Flex gap="xl" width="100%" flex="2 1 0">
          {step.form && isCollectStep ? <ProposalForm disabled={!step.form.contribuable} /> : null}
          <VoteStepSearchBar />
        </Flex>
        <Flex gap="xl" width="100%" flex="1 1 0">
          <Flex flex="none">---- Les autres filtres ----</Flex>
          {hasMapView ? (
            <Box flex="none">
              <Button
                variant="secondary"
                leftIcon={CapUIIcon.Pin}
                onClick={() => {
                  setIsMapExpanded(0)
                  setIsMapShown(isMapShown == 1 ? 0 : 1)
                }}
              >
                {!isMapShown ? 'Afficher la carte' : 'Masquer la carte'}
              </Button>
            </Box>
          ) : null}
        </Flex>
      </Flex>
      {step.votable ? (
        <Box flex="1 1 0">
          <ProposalStepUserVotesInfos step={step} />
        </Box>
      ) : null}
    </Flex>
  )
}

export default VoteStepFiltersWeb
