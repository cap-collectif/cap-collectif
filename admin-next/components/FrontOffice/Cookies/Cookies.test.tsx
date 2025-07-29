/* eslint-env jest */
import React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import CookieModal from './CookieModal'
import CookieBanner from './CookieBanner'
import CookieContent from './CookieContent'
import CookieManager from './CookieManager'
import MockProviders, { mockedSSRData } from 'tests/testUtils'

describe('<CookieModal />', () => {
  it('renders correctly', () => {
    const testComponentTree = ReactTestRenderer.create(
      <MockProviders>
        <CookieModal SSRData={mockedSSRData} />
      </MockProviders>,
    )
    expect(testComponentTree).toMatchSnapshot()
  })
})
describe('<CookieBanner />', () => {
  it('renders correctly', () => {
    const testComponentTree = ReactTestRenderer.create(
      <MockProviders>
        <CookieBanner onOpen={jest.fn} onAccept={jest.fn} onRefuse={jest.fn} />
      </MockProviders>,
    )
    expect(testComponentTree).toMatchSnapshot()
  })
})
describe('<CookieContent />', () => {
  it('renders correctly', () => {
    const testComponentTree = ReactTestRenderer.create(
      <MockProviders>
        <CookieContent SSRData={mockedSSRData} />
      </MockProviders>,
    )
    expect(testComponentTree).toMatchSnapshot()
  })
})
describe('<CookieManager />', () => {
  it('renders correctly', () => {
    const testComponentTree = ReactTestRenderer.create(
      <MockProviders>
        <CookieManager SSRData={mockedSSRData} />
      </MockProviders>,
    )
    expect(testComponentTree).toMatchSnapshot()
  })
})
