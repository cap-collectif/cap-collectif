/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import ColorPickerInput from './ColorPickerInput'

const props = {
  onChange: jest.fn(),
  value: '#ABCDEF',
}
/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<ColorPickerInput />', () => {
  it('renders correctly', () => {
    const wrapper = shallow(<ColorPickerInput {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
