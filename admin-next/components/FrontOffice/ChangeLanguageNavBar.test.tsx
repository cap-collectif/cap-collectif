/* eslint-env jest */
import { render } from '@testing-library/react'
import ChangeLanguageNavBar from './ChangeLanguageNavBar'
import MockProviders, { mockedSSRData } from 'tests/testUtils'

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a snapshot; add explicit assertions for the observable result.
 */
describe('<ChangeLanguageNavBar />', () => {
  it('renders correctly', () => {
    const { asFragment } = render(
      <MockProviders>
        <ChangeLanguageNavBar locales={mockedSSRData.locales} />
      </MockProviders>,
    )
    expect(asFragment()).toMatchSnapshot()
  })
})
