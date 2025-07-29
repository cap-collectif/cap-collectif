import React from 'react'
import { graphql, useFragment } from 'react-relay'
import { ConsultationStepRequirements_consultationStep$key } from '@relay/ConsultationStepRequirements_consultationStep.graphql'
import { FormProvider, UseFormReturn } from 'react-hook-form'
import Requirements from '@components/BackOffice/Requirements/Requirements'

type Props = {
  consultationStep: ConsultationStepRequirements_consultationStep$key
  formMethods: UseFormReturn<any>
}

const CONSULTATION_STEP_FRAGMENT = graphql`
  fragment ConsultationStepRequirements_consultationStep on ConsultationStep {
    ... on RequirementStep {
      ...Requirements_requirementStep
    }
  }
`

const ConsultationStepRequirements: React.FC<Props> = ({ consultationStep: consultationStepRef, formMethods }) => {
  const consultationStep = useFragment(CONSULTATION_STEP_FRAGMENT, consultationStepRef)

  return (
    <FormProvider {...formMethods}>
      <Requirements requirementStep={consultationStep} />
    </FormProvider>
  )
}

export default ConsultationStepRequirements
