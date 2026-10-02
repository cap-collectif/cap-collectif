/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { Status } from './Status'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<Status />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<Status>My Status</Status>)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly with other bgColor', () => {
    const wrapper = shallow(<Status bgColor="DANGER">My Status</Status>)
    expect(wrapper).toMatchSnapshot()
  })
})
