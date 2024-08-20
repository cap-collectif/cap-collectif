/* eslint-env jest */
import * as React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import EyeBar from './EyeBar'
import MockProviders from 'tests/testUtils'

describe('<EyeBar />', () => {
  it('renders correctly', () => {
    const props = {
      className: 'eye-bar',
      size: 16,
      color: 'black',
    }
    const testComponentTree = ReactTestRenderer.create(
      <MockProviders>
        <EyeBar {...props} />
      </MockProviders>,
    )
    expect(testComponentTree).toMatchSnapshot()
  })
})
