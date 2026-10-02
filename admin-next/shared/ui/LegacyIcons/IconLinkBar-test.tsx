/* eslint-env jest */
import { render } from '@testing-library/react'
import IconLinkBar from './IconLinkBar'
import MockProviders from 'tests/testUtils'

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a snapshot; add explicit assertions for the observable result.
 */
describe('<IconLinkBar />', () => {
  it('renders correctly', () => {
    const props = {
      url: '/url',
      message: 'capco.message',
      color: 'black',
    }
    const { asFragment } = render(
      <MockProviders>
        <IconLinkBar {...props}>IconToRender</IconLinkBar>
      </MockProviders>,
    )
    expect(asFragment()).toMatchSnapshot()
  })
})
