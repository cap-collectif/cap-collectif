import React from 'react'
import { render, screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'
import MockProviders from 'tests/testUtils'
import AddressInput from './AddressInput'
import { FormValues } from '../ProposalFormModal.type'

jest.mock('@react-google-maps/api', () => ({
  useJsApiLoader: () => ({ isLoaded: false }),
}))

const AddressForm = () => {
  const form = useForm<FormValues>()
  return (
    <FormProvider {...form}>
      <AddressInput
        control={form.control}
        addressHelpText="Address help"
        showLocateButton={false}
        proposalInAZoneRequired={false}
        districts={[]}
        onDistrictChange={() => {}}
      />
    </FormProvider>
  )
}

test('reserves the address help ID for help text while Google Maps loads', () => {
  const { container } = render(
    <MockProviders>
      <AddressForm />
    </MockProviders>,
  )

  expect(screen.getByText('global.loading').id).toBe('')
  expect(screen.getByText('Address help').id).toBe('proposal_address-help')
  expect(container.querySelectorAll('[id="proposal_address-help"]')).toHaveLength(1)
})
