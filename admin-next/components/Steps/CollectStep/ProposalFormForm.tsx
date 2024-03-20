import * as React from 'react'
import { graphql, useFragment } from 'react-relay'
import { Tabs, Box, CapUIRadius } from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import { ProposalFormForm_step$key } from '@relay/ProposalFormForm_step.graphql'
import { ProposalFormForm_query$key } from '@relay/ProposalFormForm_query.graphql'
import ProposalFormListField from '@components/Steps/CollectStep/ProposalFormListField'
import { FormTabsEnum, useCollectStep } from './CollectStepContext'
import ProposalForm from './ProposalForm'

export interface ProposalFormFormProps {
  step: ProposalFormForm_step$key
  query: ProposalFormForm_query$key
  defaultLocale: string
}

const PROPOSALFORMFORM_STEP_FRAGMENT = graphql`
  fragment ProposalFormForm_step on Step {
    ... on CollectStep {
      id
      form {
        ...ProposalFormListField_proposalForm
      }
    }
  }
`
const PROPOSALFORMFORM_QUERY_FRAGMENT = graphql`
  fragment ProposalFormForm_query on Query {
    ...ProposalFormListField_query
    ...ProposalForm_query
  }
`

const ProposalFormForm: React.FC<ProposalFormFormProps> = ({ step: stepRef, query: queryRef, defaultLocale }) => {
  const step = useFragment(PROPOSALFORMFORM_STEP_FRAGMENT, stepRef)
  const query = useFragment(PROPOSALFORMFORM_QUERY_FRAGMENT, queryRef)
  const intl = useIntl()
  const form = step.form

  const { operationType, setProposalFormKey, selectedTab, setSelectedTab } = useCollectStep()
  const isEditing = operationType === 'EDIT'

  if (isEditing) {
    return (
      <Box bg="#F7F7F8" p={6} borderRadius={CapUIRadius.Accordion} id="form_tab">
        <ProposalForm defaultLocale={defaultLocale} query={query} />
      </Box>
    )
  }

  return (
    <Tabs
      selectedId={selectedTab}
      onChange={selected => {
        if (selected === FormTabsEnum.NEW) {
          setProposalFormKey('form')
          setSelectedTab(FormTabsEnum.NEW)
        } else {
          setProposalFormKey('form_model')
          setSelectedTab(FormTabsEnum.MODEL)
        }
      }}
    >
      <Tabs.ButtonList ariaLabel={intl.formatMessage({ id: 'proposal-form' })}>
        <Tabs.Button id={FormTabsEnum.NEW}>{intl.formatMessage({ id: 'global.new' })}</Tabs.Button>
        <Tabs.Button id={FormTabsEnum.MODEL}>{intl.formatMessage({ id: 'from-model' })}</Tabs.Button>
      </Tabs.ButtonList>
      <Tabs.PanelList>
        <Tabs.Panel id="form_tab">
          <ProposalForm defaultLocale={defaultLocale} query={query} />
        </Tabs.Panel>

        <Tabs.Panel id="form_model_tab">
          <ProposalFormListField proposalForm={form} query={query} />
          <ProposalForm defaultLocale={defaultLocale} query={query} />
        </Tabs.Panel>
      </Tabs.PanelList>
    </Tabs>
  )
}

export default ProposalFormForm
