/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import CounterNavItem from './CounterNavItem'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<CounterNavItem />', () => {
  const props = {
    counter: 2,
    icon: 'cap cap-hand-1-2',
    label: 'blabla',
  }
  it('should render a li, an icon, a value and a label', () => {
    const wrapper = shallow(<CounterNavItem {...props} />)
    expect(wrapper.find('li')).toHaveLength(1)
    expect(wrapper.find('i')).toHaveLength(1)
    expect(wrapper.find('span.value')).toHaveLength(1)
    expect(wrapper.find('FormattedMessage')).toHaveLength(1)
  })
})
