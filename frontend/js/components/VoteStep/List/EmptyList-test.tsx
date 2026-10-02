/* eslint-env jest */
import * as React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import EmptyList from './EmptyList'
import MockProviders from '~/testUtils'

/**
 * @jest-status legacy
 * @jest-reason Uses react-test-renderer or the historical Relay renderer instead of observing public DOM
 * behavior.
 */
describe('<EmptyList />', () => {
  it('should render correctly', () => {
    const testComponentTree = ReactTestRenderer.create(
      <MockProviders useCapUIProvider>
        <EmptyList />
      </MockProviders>,
    )
    expect(testComponentTree).toMatchSnapshot()
  })
})
