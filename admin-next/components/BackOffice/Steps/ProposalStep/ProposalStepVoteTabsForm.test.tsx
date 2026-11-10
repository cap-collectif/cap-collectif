import { fireEvent, render, screen } from '@testing-library/react'
import { CapUIProvider } from '@cap-collectif/ui'
import { FormProvider, useForm } from 'react-hook-form'
import { IntlProvider } from 'react-intl'
import { RelayEnvironmentProvider } from 'react-relay'
import { createOperationDescriptor } from 'relay-runtime'
import { createMockEnvironment } from 'relay-test-utils'
import featureFlagQuery from '@relay/useFeatureFlagQuery.graphql'
import ProposalStepVoteTabsForm from './ProposalStepVoteTabsForm'

jest.mock('@components/BackOffice/Form/TextEditor/TextEditor', () => () => null)

const TestForm = ({ voteType }: { voteType: 'SIMPLE' | 'DISABLED' }) => {
  const formMethods = useForm({
    defaultValues: {
      _voteTypeForTabs: voteType,
      budget: null,
      voteThreshold: null,
      votesMin: null,
      votesLimit: null,
      votesRanking: false,
      secretBallot: false,
      voteBtnAction: 'vote',
      voteBtnIcon: 'ThumbUp',
    },
  })
  return (
    <FormProvider {...formMethods}>
      <ProposalStepVoteTabsForm formMethods={formMethods} defaultLocale="en-GB" />
    </FormProvider>
  )
}

const renderForm = (voteType: 'SIMPLE' | 'DISABLED', enabled = true) => {
  const environment = createMockEnvironment()
  environment.commitPayload(createOperationDescriptor(featureFlagQuery, {}), {
    featureFlags: [
      { type: 'votes_min', enabled: false },
      { type: 'new_new_vote_step', enabled },
    ],
  })
  render(
    <RelayEnvironmentProvider environment={environment}>
      <CapUIProvider>
        <IntlProvider
          locale="en"
          messages={{
            'step.vote_type.simple': 'Simple',
            'global.advanced.text': 'Advanced',
            action_disable: 'Disabled',
            'step.vote.btn.icon.title': 'Vote icon',
            'step.vote.btn.action.title': 'Vote action',
            'step.vote.btn.action.vote': 'Vote',
            'step.vote.btn.action.support': 'Support',
          }}
        >
          <TestForm voteType={voteType} />
        </IntlProvider>
      </CapUIProvider>
    </RelayEnvironmentProvider>,
  )
}

/**
 * @jest-status compliant
 * @jest-reason Exercises vote settings visibility and value preservation through the real form and tabs.
 */
describe('ProposalStepVoteTabsForm', () => {
  it('shows button settings for enabled voting and preserves the selected action across disable and re-enable', async () => {
    renderForm('DISABLED')
    expect(screen.queryByText('Vote icon')).toBeNull()
    expect(screen.queryByText('Vote action')).toBeNull()

    fireEvent.click(screen.getByRole('tab', { name: 'Simple' }))
    expect(await screen.findByText('Vote icon')).not.toBeNull()
    fireEvent.click(screen.getByRole('radio', { name: 'Support' }))

    fireEvent.click(screen.getByRole('tab', { name: 'Advanced' }))
    expect(await screen.findByText('Vote icon')).not.toBeNull()
    expect((screen.getByRole('radio', { name: 'Support' }) as HTMLInputElement).checked).toBe(true)

    fireEvent.click(screen.getByRole('tab', { name: 'Disabled' }))
    expect(screen.queryByText('Vote icon')).toBeNull()
    expect(screen.queryByText('Vote action')).toBeNull()

    fireEvent.click(screen.getByRole('tab', { name: 'Simple' }))
    expect(await screen.findByText('Vote action')).not.toBeNull()
    expect((screen.getByRole('radio', { name: 'Support' }) as HTMLInputElement).checked).toBe(true)
  })

  it('hides the button settings when the new vote step feature is disabled', () => {
    renderForm('SIMPLE', false)
    expect(screen.queryByText('Vote icon')).toBeNull()
    expect(screen.queryByText('Vote action')).toBeNull()
  })
})
