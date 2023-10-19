/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import CapcoPowered from './CapcoPowered'

describe('<CapcoPowered />', () => {
  it('renders correcty', () => {
    const props = {
      textColor: '#000',
    }
    const wrapper = shallow(<CapcoPowered {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
