/* eslint-env jest */
import * as React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import ViewChangePanel from './ViewChangePanel'
import MockProviders from '~/testUtils'

/**
 * @jest-status legacy
 * @jest-reason Uses react-test-renderer or the historical Relay renderer instead of observing public DOM
 * behavior.
 */
describe('<ViewChangePanel />', () => {
  it('should render correctly on web', () => {
    const testComponentTree = ReactTestRenderer.create(
      <MockProviders useCapUIProvider>
        <ViewChangePanel />
      </MockProviders>,
    )
    expect(testComponentTree).toMatchSnapshot()
  })
  it('should render correctly on mobile', () => {
    const testComponentTree = ReactTestRenderer.create(
      <MockProviders useCapUIProvider>
        <ViewChangePanel isMobile />
      </MockProviders>,
    )
    expect(testComponentTree).toMatchSnapshot()
  })
})
