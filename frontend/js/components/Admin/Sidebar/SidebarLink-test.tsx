/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { SidebarLink } from './SidebarLink'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<SidebarLink />', () => {
  it('renders correctly', () => {
    const wrapper = shallow(<SidebarLink text="Réglages" href="/réglages" />)
    expect(wrapper).toMatchSnapshot()
  })
})
