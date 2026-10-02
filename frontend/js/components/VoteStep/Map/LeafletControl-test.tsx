/* eslint-env jest */
import * as React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import LeafletControl from './LeafletControl'
import MockProviders from '~/testUtils'

/**
 * @jest-status legacy
 * @jest-reason Uses react-test-renderer or the historical Relay renderer instead of observing public DOM
 * behavior.
 */
describe('<LeafletControl />', () => {
  it('should render correctly', () => {
    const testComponentTree = ReactTestRenderer.create(
      <MockProviders>
        <LeafletControl position="bottomright">
          <div>content</div>
        </LeafletControl>
      </MockProviders>,
    )
    expect(testComponentTree).toMatchSnapshot()
  })
})
