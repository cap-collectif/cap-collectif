/* eslint-env jest */
import { render } from '@testing-library/react'
import EyeBar from './EyeBar'
import MockProviders from 'tests/testUtils'

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a snapshot; add explicit assertions for the observable result.
 */
describe('<EyeBar />', () => {
  it('renders correctly', () => {
    const props = {
      className: 'eye-bar',
      size: 16,
      color: 'black',
    }
    const { asFragment } = render(
      <MockProviders>
        <EyeBar {...props} />
      </MockProviders>,
    )
    expect(asFragment()).toMatchSnapshot()
  })
})
