/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import CapcoPowered from './CapcoPowered'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<CapcoPowered />', () => {
  it('renders correcty', () => {
    const props = {
      textColor: '#000',
    }
    const wrapper = shallow(<CapcoPowered {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
