/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { AvatarGroup } from './AvatarGroup'

const props = {
  childrenSize: 'small',
}
/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<AvatarGroup />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(
      <AvatarGroup>
        <div />
        <div />
      </AvatarGroup>,
    )
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly with other size', () => {
    const wrapper = shallow(
      <AvatarGroup {...props}>
        <div />
        <div />
        <div />
      </AvatarGroup>,
    )
    expect(wrapper).toMatchSnapshot()
  })
})
