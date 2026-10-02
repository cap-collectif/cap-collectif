/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import NewsLetterInput from './NewsLetterInput'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<NewsLetterInput />', () => {
  it('renders correctly', () => {
    const wrapper = shallow(<NewsLetterInput />)
    expect(wrapper).toMatchSnapshot()
  })
})
