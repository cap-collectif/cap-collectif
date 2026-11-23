import { fireEvent, render, screen } from '@testing-library/react'
import MockProviders from 'tests/testUtils'
import VoteStepFiltersAccordions from './VoteStepFiltersAccordions'
import type { Filters, FilterState } from './useVoteStepFilters'

const renderFilters = (districtEnabled: boolean) => {
  const disabled = { isEnabled: false, label: '', options: [] }
  const filters: Filters = {
    sort: { ...disabled, isEnabled: true },
    category: disabled,
    theme: { isEnabled: true, label: 'global.themes', options: [{ id: 'theme-1', title: 'Housing' }] },
    district: {
      isEnabled: districtEnabled,
      label: 'proposal_form.districts',
      options: [
        { id: 'ALL', name: 'All areas' },
        { id: 'district-1', name: 'North' },
        { id: 'district-2', name: 'South' },
      ],
    },
    status: disabled,
    userType: disabled,
  }
  const currentFilters: FilterState = {
    sort: 'random',
    category: 'ALL',
    theme: 'ALL',
    status: 'ALL',
    userType: 'ALL',
    district: 'ALL',
    contributor: 'ALL',
    term: null,
    latlng: null,
    latlngBounds: null,
  }
  const onFilterChange = jest.fn()

  render(
    <MockProviders>
      <VoteStepFiltersAccordions filters={filters} currentFilters={currentFilters} onFilterChange={onFilterChange} />
    </MockProviders>,
  )

  return onFilterChange
}

test('lists proposal form districts below themes and selects a district by ID', () => {
  const onFilterChange = renderFilters(true)
  const districtFilter = screen.getByRole('button', { name: 'proposal_form.districts' })
  expect(screen.getByRole('button', { name: 'global.themes' }).compareDocumentPosition(districtFilter)).toBe(
    Node.DOCUMENT_POSITION_FOLLOWING,
  )

  fireEvent.click(districtFilter)

  expect(screen.getByRole('radio', { name: 'All areas' })).toHaveProperty('checked', true)
  expect(screen.getByRole('radio', { name: 'North' })).toBeDefined()
  fireEvent.click(screen.getByRole('radio', { name: 'South' }))
  expect(onFilterChange).toHaveBeenCalledWith('district', 'district-2')
})

test('hides the geographic filter when it is disabled', () => {
  renderFilters(false)

  expect(screen.queryByRole('button', { name: 'proposal_form.districts' })).toBeNull()
})
