/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { FontAdminPage } from './FontAdminPage'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<FontAdminPage />', () => {
  it('renders correctly', () => {
    const wrapper = shallow(<FontAdminPage />)
    expect(wrapper).toMatchSnapshot()
  })
})
