/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import NewsLetterInput from './NewsLetterInput'

describe('<NewsLetterInput />', () => {
  it('renders correctly', () => {
    const wrapper = shallow(<NewsLetterInput />)
    expect(wrapper).toMatchSnapshot()
  })
})
