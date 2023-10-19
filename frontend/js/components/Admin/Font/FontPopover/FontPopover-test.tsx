/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import FontPopover from './FontPopover'

const props = {
  onConfirm: jest.fn(),
  onClose: jest.fn(),
}
describe('<FontPopover />', () => {
  it('renders correctly', () => {
    const wrapper = shallow(<FontPopover {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
