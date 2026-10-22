import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { FormLabel } from '@cap-collectif/ui'
import MockProviders from 'tests/testUtils'
import FormControl from './FormControl'
import FieldInput from './fieldInput/FieldInput'

const ProposalTitle = ({ errorId }: { errorId?: string }) => {
  const { control, handleSubmit } = useForm({ defaultValues: { title: '' } })
  return (
    <form noValidate onSubmit={handleSubmit(() => {})}>
      <FormControl name="title" control={control} errorId={errorId} isRequired>
        <FormLabel htmlFor="proposal_title" label="Title" />
        <FieldInput name="title" control={control} id="proposal_title" type="text" />
      </FormControl>
      <button type="submit">Publish</button>
    </form>
  )
}

test.each([['proposal_title-error'], [undefined]])('keeps the field accessible with error ID %s', async errorId => {
  render(
    <MockProviders>
      <ProposalTitle errorId={errorId} />
    </MockProviders>,
  )
  fireEvent.click(screen.getByRole('button', { name: 'Publish' }))
  const error = await screen.findByText('fill-field')
  expect(error.id).toBe(errorId ?? 'title-error')
  const input = screen.getByLabelText('Title')
  expect(input.id).toBe('proposal_title')
  expect(input.getAttribute('aria-describedby')).toBe(error.id)
})
