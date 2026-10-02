/* eslint-env jest */
import { render } from '@testing-library/react'
import CookieModal from './CookieModal'
import CookieBanner from './CookieBanner'
import CookieContent from './CookieContent'
import CookieManager from './CookieManager'
import MockProviders, { mockedSSRData } from 'tests/testUtils'

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a snapshot; add explicit assertions for the observable result.
 */
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
/**
 * @jest-status non-compliant
 * @jest-reason Checks only a snapshot; add explicit assertions for the observable result.
 */
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
/**
 * @jest-status non-compliant
 * @jest-reason Checks only a snapshot; add explicit assertions for the observable result.
 */
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
/**
 * @jest-status non-compliant
 * @jest-reason Checks only a snapshot; add explicit assertions for the observable result.
 */
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
