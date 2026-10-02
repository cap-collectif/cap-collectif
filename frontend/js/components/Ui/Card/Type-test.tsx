/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { Type } from './Type'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<Type />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<Type>My Type</Type>)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly with other bgColor', () => {
    const wrapper = shallow(<Type>My type</Type>)
    wrapper.setProps({
      bgColor: '#c3c3c3',
    })
    expect(wrapper).toMatchSnapshot()
  })
})
