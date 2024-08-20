/* eslint-env jest */
import * as React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import EarthIcon from './EarthIcon'
import MockProviders from 'tests/testUtils'

describe('<EarthIcon />', () => {
  it('renders correctly', () => {
    const props = {
      className: 'earth-icon',
      size: 16,
      color: 'black',
    }
    const testComponentTree = ReactTestRenderer.create(
      <MockProviders>
        <EarthIcon {...props} />
      </MockProviders>,
    )
    expect(testComponentTree).toMatchSnapshot()
  })
})
