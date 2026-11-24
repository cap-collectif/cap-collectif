import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { FormProvider, Resolver, useForm } from 'react-hook-form'
import MockProviders from 'tests/testUtils'
import { isWYSIWYGContentEmpty } from '@shared/utils/isWYSIWYGContentEmpty'
import DescriptionInput from './DescriptionInput'

// Jodit does not run in jsdom: render its editable area with the validation attributes it receives
jest.mock('components/BackOffice/Form/TextEditor/Jodit', () => ({
  __esModule: true,
  default: ({ invalid, errorId }: { invalid?: boolean; errorId?: string }) => (
    <div
      contentEditable
      role="textbox"
      aria-label="Description"
      aria-invalid={invalid ? 'true' : undefined}
      aria-describedby={invalid ? errorId : undefined}
    />
  ),
}))

// Same rule as the body of createProposalSchema (@hookform/resolvers is not transformed by Jest)
const resolver: Resolver<{ body: string }> = async values =>
  isWYSIWYGContentEmpty(values.body)
    ? { values: {}, errors: { body: { type: 'wysiwyg-not-empty', message: 'fill-field' } } }
    : { values, errors: {} }

const DescriptionForm = () => {
  const form = useForm<{ body: string }>({ mode: 'onChange', defaultValues: { body: '<p><br></p>' }, resolver })
  // Same steps as the publication handler of ProposalFormModal: validate, then touch the invalid fields
  const publish = async () => {
    await form.trigger()
    if (form.getFieldState('body').error) form.setValue('body', form.getValues('body'), { shouldTouch: true })
  }
  return (
    <FormProvider {...form}>
      <DescriptionInput
        control={form.control as any}
        descriptionMandatory
        descriptionHelpText={null}
        defaultLocale="fr-FR"
      />
      <button type="button" onClick={publish}>
        Publish
      </button>
    </FormProvider>
  )
}

test('exposes the error of a blank required description on its editable area', async () => {
  render(
    <MockProviders>
      <DescriptionForm />
    </MockProviders>,
  )
  const editable = screen.getByRole('textbox', { name: 'Description' })
  expect(editable.getAttribute('aria-invalid')).toBeNull()

  fireEvent.click(screen.getByRole('button', { name: 'Publish' }))

  const error = await screen.findByText('fill-field')
  expect(error.id).toBe('proposal_body-error')
  expect(editable.getAttribute('aria-invalid')).toBe('true')
  expect(editable.getAttribute('aria-describedby')).toBe('proposal_body-error')
})
