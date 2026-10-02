/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { FollowingsBox } from './FollowingsBox'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<FollowingsBox />', () => {
  it('render', () => {
    const wrapper = shallow(<FollowingsBox />)
    expect(wrapper).toMatchSnapshot()
  })
})
