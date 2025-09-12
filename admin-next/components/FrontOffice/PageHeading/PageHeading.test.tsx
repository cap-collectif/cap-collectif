/* eslint-env jest */
import { render } from '@testing-library/react'
import PageHeading from './PageHeading'
import MockProviders from 'tests/testUtils'

describe('<PageHeading />', () => {
  it('renders correctly', () => {
    const { asFragment } = render(
      <MockProviders>
        <PageHeading title="Liste des projets" subtitle="Une belle liste" body="Lorem ipsum dolor...." />
      </MockProviders>,
    )
    expect(asFragment()).toMatchSnapshot()
  })
})
