/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import Title, { TYPE } from './Title'

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
