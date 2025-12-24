import { Box, Flex } from '@cap-collectif/ui'
import { VoteStepActionsModal_filters_query$key } from '@relay/VoteStepActionsModal_filters_query.graphql'
import { VoteStepListHeader_proposalStep$key } from '@relay/VoteStepListHeader_proposalStep.graphql'
import { pxToRem } from '@shared/utils/pxToRem'
import * as React from 'react'
import { graphql, useFragment } from 'react-relay'
import VoteStepSearchBar from './Filters/VoteStepSearchBar'
import VoteStepListActions from './ListActions/VoteStepListActions'
import ProposalForm from './ProposalForm/ProposalForm'
import VoteStepUserInfos from './VoteStepUserInfos'

type Props = {
  step: VoteStepListHeader_proposalStep$key
  filtersConnection: VoteStepActionsModal_filters_query$key
}

const FRAGMENT = graphql`
  fragment VoteStepListHeader_proposalStep on ProposalStep {
    __typename
    votable
    form {
      contribuable
      ...VoteStepListActions_proposalForm
    }
    ...VoteStepUserInfos_proposalStep
  }
`

const VoteStepListHeader: React.FC<Props> = ({ step: stepKey, filtersConnection }) => {
  const step = useFragment(FRAGMENT, stepKey)
  const isCollectStep = step.__typename === 'CollectStep'

  return (
    <Flex gap="lg" width="100%" align="start">
      <Box width="100%" flex="2 1 0">
        <Flex gap="xl" width="100%">
          {step.form && isCollectStep ? <ProposalForm disabled={!step.form.contribuable} /> : null}
          <VoteStepSearchBar />
        </Flex>
        <VoteStepListActions form={step.form} filtersConnection={filtersConnection} />
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
