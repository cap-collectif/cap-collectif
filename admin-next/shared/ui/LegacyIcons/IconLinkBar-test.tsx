/* eslint-env jest */
import * as React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import IconLinkBar from './IconLinkBar'
import MockProviders from 'tests/testUtils'

describe('<IconLinkBar />', () => {
  it('renders correctly', () => {
    const props = {
      url: '/url',
      message: 'capco.message',
      color: 'black',
    }
    const testComponentTree = ReactTestRenderer.create(
      <MockProviders>
        <IconLinkBar {...props}>IconToRender</IconLinkBar>
      </MockProviders>,
    )
    expect(testComponentTree).toMatchSnapshot()
  })
})
