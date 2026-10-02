/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { CookieModal } from './CookieModal'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<CookieModal />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<CookieModal />)
    expect(wrapper).toMatchSnapshot()
  })
})
