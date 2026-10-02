/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { AvatarCount } from './AvatarCount'

const props = {
  size: 'small',
}
/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<AvatarCount />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<AvatarCount>9</AvatarCount>)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly with other size', () => {
    const wrapper = shallow(<AvatarCount {...props}>9</AvatarCount>)
    expect(wrapper).toMatchSnapshot()
  })
})
