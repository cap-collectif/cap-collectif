/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import Title, { TYPE } from './Title'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<Title />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<Title type={TYPE.H1}>My title</Title>)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly with other type', () => {
    const wrapper = shallow(<Title type={TYPE.H2}>My title</Title>)
    expect(wrapper).toMatchSnapshot()
  })
})
