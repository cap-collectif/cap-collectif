/* eslint-env jest */
import { render } from '@testing-library/react'
import ShieldPageWrapper from './ShieldPageWrapper'
import MockProviders, { mockedSSRData } from 'tests/testUtils'

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a snapshot; add explicit assertions for the observable result.
 */
describe('<ShieldPageWrapper />', () => {
  it('renders correctly', () => {
    const { asFragment } = render(
      <MockProviders>
        <ShieldPageWrapper SSRData={mockedSSRData} />
      </MockProviders>,
    )
    expect(asFragment()).toMatchSnapshot()
  })
})
