/* eslint-env jest */
import { render } from '@testing-library/react'
import PageHeading from './PageHeading'
import MockProviders from 'tests/testUtils'

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a snapshot; add explicit assertions for the observable result.
 */
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
