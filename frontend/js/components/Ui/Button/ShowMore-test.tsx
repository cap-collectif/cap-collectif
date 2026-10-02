/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import ShowMore from './ShowMore'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<ShowMore/>', () => {
  it('should render correctly', () => {
    const props = {
      onClick: jest.fn(),
    }
    const wrapper = shallow(<ShowMore {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
