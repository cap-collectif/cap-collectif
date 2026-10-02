/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import FontPopover from './FontPopover'

const props = {
  onConfirm: jest.fn(),
  onClose: jest.fn(),
}
/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<FontPopover />', () => {
  it('renders correctly', () => {
    const wrapper = shallow(<FontPopover {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
