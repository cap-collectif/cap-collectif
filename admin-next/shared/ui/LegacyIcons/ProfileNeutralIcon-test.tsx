/* eslint-env jest */
import { render } from '@testing-library/react'
import ProfileNeutralIcon from './ProfileNeutralIcon'
import MockProviders from 'tests/testUtils'

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a snapshot; add explicit assertions for the observable result.
 */
describe('<ProfileNeutralIcon />', () => {
  it('renders correctly', () => {
    const props = {
      className: 'profile-neutral-icon',
      size: 16,
      color: 'black',
    }
    const { asFragment } = render(
      <MockProviders>
        <ProfileNeutralIcon {...props} />
      </MockProviders>,
    )
    expect(asFragment()).toMatchSnapshot()
  })
})
