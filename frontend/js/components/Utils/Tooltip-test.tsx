/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import Tooltip from './Tooltip'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<Tooltip />', () => {
  const props = {
    children: 'child',
    id: 'id',
  }
  it('should render correctly', () => {
    const wrapper = shallow(<Tooltip {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
