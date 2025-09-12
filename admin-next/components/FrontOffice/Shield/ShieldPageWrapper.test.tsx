/* eslint-env jest */
import { render } from '@testing-library/react'
import ShieldPageWrapper from './ShieldPageWrapper'
import MockProviders, { mockedSSRData } from 'tests/testUtils'

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
