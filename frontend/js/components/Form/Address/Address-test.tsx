/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import Address from './Address'

const baseProps = {
  id: 'id',
  onChange: jest.fn(),
  value: '12 rue des tulipes',
}
const props = {
  basic: baseProps,
  withGetPosition: { ...baseProps, getPosition: jest.fn() },
  withGetAddress: { ...baseProps, getAddress: jest.fn() },
  noReset: { ...baseProps, allowReset: false },
  hiddenSearchBar: { ...baseProps, showSearchBar: false },
  noValue: { ...baseProps, value: null },
}
describe('<Address />', () => {
  it('renders correctly', () => {
    const wrapper = shallow(<Address {...props.basic} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('renders correctly with get position of user', () => {
    const wrapper = shallow(<Address {...props.withGetPosition} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('renders correctly with get address', () => {
    const wrapper = shallow(<Address {...props.withGetAddress} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('renders correctly when not reset button display', () => {
    const wrapper = shallow(<Address {...props.noReset} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('renders correctly when hide search bar', () => {
    const wrapper = shallow(<Address {...props.hiddenSearchBar} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('renders correctly when no value', () => {
    const wrapper = shallow(<Address {...props.noValue} />)
    expect(wrapper).toMatchSnapshot()
  })
})
