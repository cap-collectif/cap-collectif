/* eslint-env jest */
import * as React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import PowerButtonIcon from './PowerButtonIcon'
import MockProviders from 'tests/testUtils'

describe('<PowerButtonIcon />', () => {
  it('renders correctly', () => {
    const props = {
      className: 'power-button-icon',
      size: 16,
      color: 'black',
    }
    const testComponentTree = ReactTestRenderer.create(
      <MockProviders>
        <PowerButtonIcon {...props} />
      </MockProviders>,
    )
    expect(testComponentTree).toMatchSnapshot()
  })
})
