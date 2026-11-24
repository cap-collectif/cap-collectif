import type { AddressComplete } from '@cap-collectif/form'
import type { ProposalFormModal_proposalForm$data } from '@relay/ProposalFormModal_proposalForm.graphql'
import { findDistrictAt, formatGeoJsons } from '@utils/geojson'
import { createIntl } from 'react-intl'
import { createProposalSchema } from './utils'

const district = {
  id: 'district',
  displayedOnMap: false,
  geojson: JSON.stringify({
    type: 'Polygon',
    coordinates: [
      [
        [2, 48],
        [3, 48],
        [3, 49],
        [2, 49],
        [2, 48],
      ],
    ],
  }),
}

const proposalForm = {
  usingAddress: true,
  usingDistrict: true,
  proposalInAZoneRequired: true,
  districts: [district],
} as ProposalFormModal_proposalForm$data

const intl = createIntl({
  locale: 'en',
  messages: {
    'fill-field': 'Required',
    'global.invalid-url': 'Invalid URL',
    'constraints.address_in_zone': 'Choose an address in a geographical area',
  },
})

const addressAt = (location: { lat: number; lng: number }): AddressComplete => ({
  formatted_address: 'Selected address',
  address_components: [],
  types: [],
  geometry: { location, location_type: 'ROOFTOP' },
})

test('shows the geographical area on the map only when it is configured to be displayed', () => {
  const visibleDistrict = { ...district, id: 'visible', displayedOnMap: true }

  expect(formatGeoJsons([district, visibleDistrict]).map(({ id }) => id)).toEqual(['visible'])
})

test('matches a restricted address to its geographical area even when the outlines are hidden', async () => {
  const address = addressAt({ lat: 48.5, lng: 2.5 })
  const schema = createProposalSchema(proposalForm, intl, () => address)

  expect(findDistrictAt(proposalForm.districts, address.geometry.location)).toBe(district.id)
  await expect(schema.validateAt('address', { address: address.formatted_address })).resolves.toBe(
    address.formatted_address,
  )
})

test.each([
  { description: 'outside the geographical area', address: addressAt({ lat: 47, lng: 2.5 }), text: 'Selected address' },
  { description: 'typed over a selected address', address: addressAt({ lat: 48.5, lng: 2.5 }), text: 'Edited address' },
  { description: 'typed without selecting a suggestion', address: null, text: 'Typed address' },
])('shows an address field error for an address $description', async ({ address, text }) => {
  const schema = createProposalSchema(proposalForm, intl, () => address)

  await expect(schema.validateAt('address', { address: text })).rejects.toMatchObject({
    path: 'address',
    message: 'Choose an address in a geographical area',
  })
})

test('accepts an address outside the geographical area when the restriction is disabled', async () => {
  const address = addressAt({ lat: 47, lng: 2.5 })
  const schema = createProposalSchema({ ...proposalForm, proposalInAZoneRequired: false }, intl, () => address)

  await expect(schema.validateAt('address', { address: address.formatted_address })).resolves.toBe(
    address.formatted_address,
  )
})
