/* eslint-env jest */
import { render } from '@testing-library/react'
import PowerButtonIcon from './PowerButtonIcon'
import MockProviders from 'tests/testUtils'

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a snapshot; add explicit assertions for the observable result.
 */
describe('<PowerButtonIcon />', () => {
  it('renders correctly', () => {
    const props = {
      className: 'power-button-icon',
      size: 16,
      color: 'black',
    }
    const { asFragment } = render(
      <MockProviders>
        <PowerButtonIcon {...props} />
      </MockProviders>,
    )
    expect(asFragment()).toMatchSnapshot()
  })
})
