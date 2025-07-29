/* eslint-env jest */
import React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import ShieldPageWrapper from './ShieldPageWrapper'
import MockProviders, { mockedSSRData } from 'tests/testUtils'

describe('<ShieldPageWrapper />', () => {
  it('renders correctly', () => {
    const testComponentTree = ReactTestRenderer.create(
      <MockProviders>
        <ShieldPageWrapper SSRData={mockedSSRData} />
      </MockProviders>,
    )
    expect(testComponentTree).toMatchSnapshot()
  })
})
