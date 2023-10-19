/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import Approve from './Approve'

describe('<Approve />', () => {
  const props = {
    input: {
      onChange: jest.fn(),
      value: 'VALIDEY',
    },
    approvedValue: 'VALIDEY',
    refusedValue: 'REFUSEY',
    disabled: false,
  }
  it('should render correctly disabled false', () => {
    const wrapper = shallow(<Approve {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly disabled', () => {
    const wrapper = shallow(<Approve {...props} disabled />)
    expect(wrapper).toMatchSnapshot()
  })
})
