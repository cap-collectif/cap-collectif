/* eslint-env jest */
import * as React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import CheckCircle from './CheckCircle'
import MockProviders from 'tests/testUtils'

describe('<CheckCircle />', () => {
  it('renders correctly', () => {
    const props = {
      className: 'check-circle',
      size: 20,
      color: 'black',
    }
    const testComponentTree = ReactTestRenderer.create(
      <MockProviders>
        <CheckCircle {...props} />
      </MockProviders>,
    )
    expect(testComponentTree).toMatchSnapshot()
  })
})
