/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import Popover from './Popover'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<Popover />', () => {
  const props = {
    children: 'child',
  }
  it('should render correctly', () => {
    const wrapper = shallow(<Popover {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
