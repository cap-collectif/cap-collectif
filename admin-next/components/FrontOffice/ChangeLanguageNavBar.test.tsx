/* eslint-env jest */
import { render } from '@testing-library/react'
import ChangeLanguageNavBar from './ChangeLanguageNavBar'
import MockProviders, { mockedSSRData } from 'tests/testUtils'

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
