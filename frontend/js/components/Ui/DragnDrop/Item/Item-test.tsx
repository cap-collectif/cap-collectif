/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import Item from './Item'

const baseItem = {
  id: '1',
  position: 0,
}
const item = {
  basic: { ...baseItem },
  withOtherProps: { ...baseItem, id: '2', position: 2 },
  empty: { ...baseItem, isEmpty: true },
}
describe('<Item />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<Item {...item.basic}>Bonjour</Item>)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly with other props', () => {
    const wrapper = shallow(<Item {...item.withOtherProps}>Bonjour 2</Item>)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly when empty', () => {
    const wrapper = shallow(<Item {...item.empty} />)
    expect(wrapper).toMatchSnapshot()
  })
})
