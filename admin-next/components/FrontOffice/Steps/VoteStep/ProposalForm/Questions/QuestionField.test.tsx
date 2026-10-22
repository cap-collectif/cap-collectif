import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'
import MockProviders from 'tests/testUtils'
import QuestionField from './QuestionField'

jest.mock('components/BackOffice/Form/TextEditor/TextEditor', () => () => null)

const QuestionForm = ({ type }: { type: string }) => {
  const form = useForm({ defaultValues: { answer: '' } })
  return (
    <FormProvider {...form}>
      <form noValidate onSubmit={form.handleSubmit(() => {})}>
        <QuestionField
          question={{ id: 'question1', title: 'Question', type, required: true, helpText: 'Question help' }}
          id="proposal-form-responses0"
          name="answer"
          control={form.control}
          defaultLocale="fr-FR"
        />
        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  )
}

test.each(['text', 'select'])('matches legacy label and help IDs for a %s question', async type => {
  const { container } = render(
    <MockProviders>
      <QuestionForm type={type} />
    </MockProviders>,
  )

  expect(screen.getByText('Question').closest('label')?.id).toBe(
    type === 'select' ? 'label-select-proposal-form-responses0' : 'label-proposal-form-responses0',
  )
  expect(screen.getByText('Question help').id).toBe(type === 'select' ? '' : 'proposal-form-responses0-help')
  expect(container.querySelector('[id="proposal-form-responses0"]')).not.toBeNull()

  fireEvent.click(screen.getByRole('button', { name: 'Submit' }))
  const error = await screen.findByText('fill-field')
  expect(error.id).toBe(type === 'select' ? 'answer-error' : 'proposal-form-responses0-error')
})
