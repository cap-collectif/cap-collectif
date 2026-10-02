/* eslint-env jest */
import { render } from '@testing-library/react'
import DropzoneWrapper from './DropzoneWrapper'
import { MockProviders } from 'tests/testUtils'

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a snapshot; add explicit assertions for the observable result.
 */
describe('<DropzoneWrapper />', () => {
  it('should render correctly', () => {
    const { asFragment } = render(
      <MockProviders>
        <DropzoneWrapper>content</DropzoneWrapper>
      </MockProviders>,
    )
    expect(asFragment()).toMatchSnapshot()
  })
})
