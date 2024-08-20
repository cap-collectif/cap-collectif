/* eslint-env jest */
import * as React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import ProfileNeutralIcon from './ProfileNeutralIcon'
import MockProviders from 'tests/testUtils'

describe('<ProfileNeutralIcon />', () => {
  it('renders correctly', () => {
    const props = {
      className: 'profile-neutral-icon',
      size: 16,
      color: 'black',
    }
    const testComponentTree = ReactTestRenderer.create(
      <MockProviders>
        <ProfileNeutralIcon {...props} />
      </MockProviders>,
    )
    expect(testComponentTree).toMatchSnapshot()
  })
})
