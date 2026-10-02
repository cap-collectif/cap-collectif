/* eslint-env jest */
import * as React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import EventDeleteModal from './EventDeleteModal'
import MockProviders, { addsSupportForPortals, clearSupportForPortals } from '~/testUtils'

/**
 * @jest-status legacy
 * @jest-reason Uses react-test-renderer or the historical Relay renderer instead of observing public DOM
 * behavior.
 */
describe('<EventDeleteModal />', () => {
  beforeEach(() => {
    addsSupportForPortals()
  })
  afterEach(() => {
    clearSupportForPortals()
  })
  it('should render correctly', () => {
    const testComponentTree = ReactTestRenderer.create(
      <MockProviders useCapUIProvider>
        <EventDeleteModal eventId="id" />
      </MockProviders>,
    )
    expect(testComponentTree).toMatchSnapshot()
  })
})
