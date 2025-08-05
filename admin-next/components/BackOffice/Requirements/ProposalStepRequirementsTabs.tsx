import React from 'react'
import { Tabs } from '@cap-collectif/ui'
import { FormProvider, UseFormReturn } from 'react-hook-form'
import { useIntl } from 'react-intl'
import { graphql, useFragment } from 'react-relay'
import { ProposalStepRequirementsTabs_proposalStep$key } from '@relay/ProposalStepRequirementsTabs_proposalStep.graphql'
import ProposalStepWithoutAccountRequirements from '@components/BackOffice/Requirements/ProposalStepWithoutAccountRequirements'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
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
  const intl = useIntl()
  const proposalStep = useFragment(COLLECT_STEP_FRAGMENT, proposalStepRef)

  const isTwilioEnabled = useFeatureFlag('twilio')
  const isProposalSmsVoteFeature = useFeatureFlag('proposal_sms_vote')
  const canVoteAnonymously = isTwilioEnabled && isProposalSmsVoteFeature;

  const { watch, setValue } = formMethods

  const WITH_ACCOUNT = 'WITH_ACCOUNT'
  const WITHOUT_ACCOUNT = 'WITHOUT_ACCOUNT'
  const isProposalSmsVoteEnabled = watch('isProposalSmsVoteEnabled')
  const voteType = isProposalSmsVoteEnabled ? WITHOUT_ACCOUNT : WITH_ACCOUNT

  return (
    <FormProvider {...formMethods}>
      <Tabs
        mb={6}
        selectedId={voteType}
        onChange={selectedTab => {
          if (selectedTab !== voteType) {
            const isProposalSmsVoteEnabled = selectedTab === WITHOUT_ACCOUNT
            setValue('isProposalSmsVoteEnabled', isProposalSmsVoteEnabled)
          }
        }}
      >
        <Tabs.ButtonList ariaLabel="voteType">
          <Tabs.Button id={WITH_ACCOUNT}>{intl.formatMessage({ id: 'with-account' })}</Tabs.Button>
          <Tabs.Button disabled={!canVoteAnonymously} id={WITHOUT_ACCOUNT}>
            {intl.formatMessage({ id: 'without-account' })}
          </Tabs.Button>
        </Tabs.ButtonList>
        <Tabs.PanelList>
          <Tabs.Panel>
            <Requirements requirementStep={proposalStep} />
          </Tabs.Panel>
          <Tabs.Panel>{<ProposalStepWithoutAccountRequirements />}</Tabs.Panel>
        </Tabs.PanelList>
      </Tabs>
    </FormProvider>
  )
}

export default ProposalStepRequirementsTabs
