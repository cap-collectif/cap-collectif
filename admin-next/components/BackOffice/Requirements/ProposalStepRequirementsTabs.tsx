import React from 'react'
import { Box } from '@cap-collectif/ui'
import { FormProvider, UseFormReturn } from 'react-hook-form'
import { graphql, useFragment } from 'react-relay'
import { ProposalStepRequirementsTabs_proposalStep$key } from '@relay/ProposalStepRequirementsTabs_proposalStep.graphql'
import Requirements from './Requirements'

type Props = {
  proposalStep: ProposalStepRequirementsTabs_proposalStep$key
  formMethods: UseFormReturn<any>
}

const COLLECT_STEP_FRAGMENT = graphql`
  fragment ProposalStepRequirementsTabs_proposalStep on ProposalStep {
    __typename
    ... on RequirementStep {
      ...Requirements_requirementStep
    }
  }
`

const ProposalStepRequirementsTabs: React.FC<Props> = ({ proposalStep: proposalStepRef, formMethods }) => {
  const proposalStep = useFragment(COLLECT_STEP_FRAGMENT, proposalStepRef)

  return (
      <FormProvider {...formMethods}>
        <Box backgroundColor="gray.100" p={5}>
          <Requirements requirementStep={proposalStep} />
        </Box>
      </FormProvider>
  )
}

export default ProposalStepRequirementsTabs
