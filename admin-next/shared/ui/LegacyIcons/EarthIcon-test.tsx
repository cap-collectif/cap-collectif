/* eslint-env jest */
import * as React from 'react'
import { render } from '@testing-library/react'
import EarthIcon from './EarthIcon'
import MockProviders from 'tests/testUtils'

describe('<EarthIcon />', () => {
  it('renders correctly', () => {
    const props = {
      className: 'earth-icon',
      size: 16,
      color: 'black',
    }
    const { asFragment } = render(
      <MockProviders>
        <EarthIcon {...props} />
      </MockProviders>,
    )
    expect(asFragment()).toMatchSnapshot()
  })
})
