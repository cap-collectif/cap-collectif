/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { DefaultImage } from './DefaultImage'
import Image from '~ui/Primitives/Image'

const props = {
  width: '600px',
  height: '400px',
}
describe('<DefaultImage />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(
      <DefaultImage>
        <Image src="" alt="" />
      </DefaultImage>,
    )
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly with other size', () => {
    const wrapper = shallow(
      <DefaultImage {...props}>
        <Image src="" alt="" />
      </DefaultImage>,
    )
    expect(wrapper).toMatchSnapshot()
  })
})
