/* eslint-env jest */
import React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import WYSIWYGRender from './WYSIWYGRender'
import MockProviders from 'tests/testUtils'

const props = {
  value: '<div>Little test</div>',
  className: 'myClass',
}

const getTree = props =>
  ReactTestRenderer.create(
    <MockProviders>
      <WYSIWYGRender {...props} />
    </MockProviders>,
  )

describe('<WYSIWYGRender />', () => {
  it('should render correctly', () => {
    expect(getTree(props)).toMatchSnapshot()
  })
  it('should render correctly with tagName', () => {
    expect(getTree({ ...props, tagName: 'i' })).toMatchSnapshot()
  })
})
