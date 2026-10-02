/* eslint-env jest */
import * as React from 'react'
import { render } from '@testing-library/react'
import CheckCircle from './CheckCircle'
import MockProviders from 'tests/testUtils'

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a snapshot; add explicit assertions for the observable result.
 */
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
