/* eslint-env jest */
import { render } from '@testing-library/react'
import Footer from './Footer'
import MockProviders, { mockedSSRData } from 'tests/testUtils'

describe('<Footer />', () => {
  it('renders correctly', () => {
    const { asFragment } = render(
      <MockProviders>
        <Footer SSRData={mockedSSRData} />
      </MockProviders>,
    )
    expect(asFragment()).toMatchSnapshot()
  })
})
