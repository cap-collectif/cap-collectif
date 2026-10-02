/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import SelectOption from './SelectOption'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<SelectOption />', () => {
  const props = {
    isSelected: false,
    value: '0',
    onClick: jest.fn(),
  }
  it('should render', () => {
    const wrapper = shallow(<SelectOption {...props}>Message</SelectOption>)
    expect(wrapper).toMatchSnapshot()
  })
})
