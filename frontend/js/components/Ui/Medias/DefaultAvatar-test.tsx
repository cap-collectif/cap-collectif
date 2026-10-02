/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { DefaultAvatar } from './DefaultAvatar'

const props = {
  size: 'small',
}
/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<DefaultAvatar />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<DefaultAvatar />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly with other size', () => {
    const wrapper = shallow(<DefaultAvatar {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
