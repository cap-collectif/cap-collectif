/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { Cover } from './Cover'
import Image from '~ui/Primitives/Image'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<Cover />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(
      <Cover>
        <Image src="" alt="" />
      </Cover>,
    )
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly with other size', () => {
    const wrapper = shallow(
      <Cover>
        <Image src="" alt="" />
      </Cover>,
    )
    wrapper.setProps({
      height: '300px',
      width: '400px',
    })
    expect(wrapper).toMatchSnapshot()
  })
})
