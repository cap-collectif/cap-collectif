/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { DefaultAvatarGroup } from './DefaultAvatarGroup'

const props = {
  size: 'small',
}
/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<DefaultAvatarGroup />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<DefaultAvatarGroup />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly with other size', () => {
    const wrapper = shallow(<DefaultAvatarGroup {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
