/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import Date from './Date'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<Date />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<Date date="2030-03-10 00:00:00" />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly with other date', () => {
    const wrapper = shallow(<Date date="2030-03-10 00:00:00" />)
    wrapper.setProps({
      date: '2032-06-15 00:00:00',
    })
    expect(wrapper).toMatchSnapshot()
  })
})
