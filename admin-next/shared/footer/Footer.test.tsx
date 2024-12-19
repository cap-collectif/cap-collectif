/* eslint-env jest */
import React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import Footer from './Footer'
import MockProviders, { mockedSSRData } from 'tests/testUtils'

describe('<Footer />', () => {
  it('renders correctly', () => {
    const testComponentTree = ReactTestRenderer.create(
      <MockProviders>
        <Footer SSRData={mockedSSRData} />
      </MockProviders>,
    )
    expect(testComponentTree).toMatchSnapshot()
  })
})
