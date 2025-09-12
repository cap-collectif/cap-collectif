/* eslint-env jest */
import { render } from '@testing-library/react'
import ViewButton from './ViewButton'
import { MockProviders } from 'tests/testUtils'
import { CapUIIcon } from '@cap-collectif/ui'

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
