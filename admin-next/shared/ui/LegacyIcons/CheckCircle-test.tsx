/* eslint-env jest */
import * as React from 'react'
import { render } from '@testing-library/react'
import CheckCircle from './CheckCircle'
import MockProviders from 'tests/testUtils'

describe('<CheckCircle />', () => {
  it('renders correctly', () => {
    const props = {
      className: 'check-circle',
      size: 20,
      color: 'black',
    }
    const { asFragment } = render(
      <MockProviders>
        <CheckCircle {...props} />
      </MockProviders>,
    )
    expect(asFragment()).toMatchSnapshot()
  })
})
