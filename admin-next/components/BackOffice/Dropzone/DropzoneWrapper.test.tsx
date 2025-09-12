/* eslint-env jest */
import { render } from '@testing-library/react'
import DropzoneWrapper from './DropzoneWrapper'
import { MockProviders } from 'tests/testUtils'

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
