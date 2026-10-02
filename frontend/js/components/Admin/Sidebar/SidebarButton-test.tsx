/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { SidebarButton } from './SidebarButton'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<SidebarButton />', () => {
  const defaultProps = {
    icon: 'ENVELOPE_O',
    disabled: false,
    text: 'MAIL',
    isOpen: false,
  }
  it('renders correctly', () => {
    const wrapper = shallow(<SidebarButton {...defaultProps} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('renders correctly open', () => {
    const wrapper = shallow(<SidebarButton {...defaultProps} isOpen />)
    expect(wrapper).toMatchSnapshot()
  })
})
