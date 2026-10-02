/* eslint-env jest */
import { render } from '@testing-library/react'
import ViewButton from './ViewButton'
import { MockProviders } from 'tests/testUtils'
import { CapUIIcon } from '@cap-collectif/ui'

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a snapshot; add explicit assertions for the observable result.
 */
describe('<ViewButton />', () => {
  it('should render correctly', () => {
    const { asFragment } = render(
      <MockProviders>
        <ViewButton active onClick={jest.fn} icon={CapUIIcon.List}>
          List
        </ViewButton>
      </MockProviders>,
    )
    expect(asFragment()).toMatchSnapshot()
  })
})
