/* eslint-env jest */
import { render } from '@testing-library/react'
import Footer from './Footer'
import MockProviders, { mockedFooterData } from 'tests/testUtils'

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a snapshot; add explicit assertions for the observable result.
 */
describe('<Footer />', () => {
  it('renders correctly', () => {
    const { asFragment } = render(
      <MockProviders>
        <Footer {...mockedFooterData} />
      </MockProviders>,
    )
    expect(asFragment()).toMatchSnapshot()
  })
})
