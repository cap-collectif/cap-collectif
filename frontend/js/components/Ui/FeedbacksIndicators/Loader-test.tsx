/* eslint-env jest */
import * as React from 'react'
import { shallow, mount } from 'enzyme'
import 'jest-styled-components'
import { Container, Loader } from './Loader'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<Loader />', () => {
  it('renders LoaderContainer', () => {
    const wrapper = mount(<Container />)
    expect(wrapper).toMatchSnapshot()
  })
  it('renders Loader', () => {
    const wrapper = shallow(<Loader />)
    expect(wrapper).toMatchSnapshot()
  })
  it('renders Loader with a white color', () => {
    const wrapper = shallow(<Loader color="white" />)
    expect(wrapper).toMatchSnapshot()
  })
  it('renders an inline Loader', () => {
    const wrapper = shallow(<Loader inline />)
    expect(wrapper).toMatchSnapshot()
  })
  it('renders Loader with a color and a small size', () => {
    const props = {
      color: 'white',
      size: 20,
    }
    const wrapper = shallow(<Loader {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('renders nothing', () => {
    const wrapper = shallow(<Loader show={false} />)
    expect(wrapper).toMatchSnapshot()
  })
})
