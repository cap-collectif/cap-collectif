import * as React from 'react'
import VoteStepSearchBar from './VoteStepSearchBar'
import { graphql, useFragment } from 'react-relay'
import { VoteStepFiltersWeb_proposalStep$key } from '@relay/VoteStepFiltersWeb_proposalStep.graphql'
import { Box, Button, CapUIIcon, Flex } from '@cap-collectif/ui'
import { useVoteStepContext } from '../VoteStepContext'
import { pxToRem } from '@shared/utils/pxToRem'
import ProposalForm from '../ProposalForm/ProposalForm'

type Props = {
  step: VoteStepFiltersWeb_proposalStep$key
}

const FRAGMENT = graphql`
  fragment VoteStepFiltersWeb_proposalStep on ProposalStep {
    __typename
    open
    form {
      contribuable
      # ...ProposalCreateModal_proposalForm
    }
  }
`

const VoteStepFiltersWeb: React.FC<Props> = ({ step: stepKey }) => {
  const step = useFragment(FRAGMENT, stepKey)
  const { hasMapView, isMapHidden, setIsMapHidden, setIsMapExpanded, isStepVotable, isCollectStep } =
    useVoteStepContext()

  return (
    <Flex gap="lg" width="100%" align="start">
      <Flex gap="xl" width="100%" flex="2 1 0" flexWrap={isStepVotable ? 'wrap' : 'nowrap'}>
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
                  setIsMapExpanded(false)
                  setIsMapHidden(!isMapHidden)
                }}
              >
                {isMapHidden ? 'Afficher la carte' : 'Masquer la carte'}
              </Button>
            </Box>
          ) : null}
        </Flex>
      </Flex>
      {isStepVotable ? (
        <Box flex="1 1 0">
          <Flex align="center" justify="center" height={pxToRem(104)} border="1px solid blue">
            TODO : VOTE COMPONENT
          </Flex>
        </Box>
      ) : null}
    </Flex>
  )
}

export default VoteStepFiltersWeb
