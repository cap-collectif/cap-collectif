import { Box, Flex } from '@cap-collectif/ui'
import { VoteStepListHeader_proposalStep$key } from '@relay/VoteStepListHeader_proposalStep.graphql'
import { pxToRem } from '@shared/utils/pxToRem'
import * as React from 'react'
import { graphql, useFragment } from 'react-relay'
import VoteStepSearchBar from './Filters/VoteStepSearchBar'
import VoteStepListActions from './ListActions/VoteStepListActions'
import ProposalCreateModal from './ProposalForm/ProposalCreateModal'
import VoteStepUserInfos from './VoteStepUserInfos'

type Props = {
  step: VoteStepListHeader_proposalStep$key
}

const FRAGMENT = graphql`
  fragment VoteStepListHeader_proposalStep on ProposalStep {
    __typename
    votable
    form {
      contribuable
      ...ProposalCreateModal_proposalForm
    }
    ...VoteStepListActions_proposalStep
    ...VoteStepUserInfos_proposalStep
  }
`

const VoteStepListHeader: React.FC<Props> = ({ step: stepKey }) => {
  const step = useFragment(FRAGMENT, stepKey)
  const isCollectStep = step.__typename === 'CollectStep'

  return (
    <Flex gap="lg" width="100%" align="start">
      <Box width="100%" flex="2 1 0">
        <Flex gap="xl" width="100%">
          {step.form && isCollectStep ? (
            <ProposalCreateModal disabled={!step.form.contribuable} proposalForm={step.form} />
          ) : null}
          <VoteStepSearchBar />
        </Flex>
        <VoteStepListActions step={step} />
      </Box>
      {step.votable ? (
        <Box flex={`0 1 ${pxToRem(395)}`} position="relative" minHeight={pxToRem(116)}>
          <VoteStepUserInfos step={step} />
        </Box>
      ) : null}
    </Flex>
  )
}

export default VoteStepListHeader
