/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { RatioMediaContainer } from './RatioMediaContainer'
import Image from '~ui/Primitives/Image'

const props = {
  ratioX: 9,
  ratioY: 3,
}
/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<RatioMediaContainer />', () => {
  it('should render correctly default RatioMediaContainer', () => {
    const wrapper = shallow(
      <RatioMediaContainer>
        <Image src="" alt="" />
      </RatioMediaContainer>,
    )
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly with other props', () => {
    const wrapper = shallow(
      <RatioMediaContainer {...props}>
        <Image src="" alt="" />
      </RatioMediaContainer>,
    )
    expect(wrapper).toMatchSnapshot()
  })
})
