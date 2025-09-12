/* eslint-env jest */
import { render } from '@testing-library/react'
import CookieModal from './CookieModal'
import CookieBanner from './CookieBanner'
import CookieContent from './CookieContent'
import CookieManager from './CookieManager'
import MockProviders, { mockedSSRData } from 'tests/testUtils'

describe('<CookieModal />', () => {
  it('renders correctly', () => {
    const { asFragment } = render(
      <MockProviders>
        <CookieModal SSRData={mockedSSRData} />
      </MockProviders>,
    )
    expect(asFragment()).toMatchSnapshot()
  })
})
describe('<CookieBanner />', () => {
  it('renders correctly', () => {
    const { asFragment } = render(
      <MockProviders>
        <CookieBanner onOpen={jest.fn} onAccept={jest.fn} onRefuse={jest.fn} />
      </MockProviders>,
    )
    expect(asFragment()).toMatchSnapshot()
  })
})
describe('<CookieContent />', () => {
  it('renders correctly', () => {
    const { asFragment } = render(
      <MockProviders>
        <CookieContent SSRData={mockedSSRData} />
      </MockProviders>,
    )
    expect(asFragment()).toMatchSnapshot()
  })
})
describe('<CookieManager />', () => {
  it('renders correctly', () => {
    const { asFragment } = render(
      <MockProviders>
        <CookieManager SSRData={mockedSSRData} />
      </MockProviders>,
    )
    expect(asFragment()).toMatchSnapshot()
  })
})
