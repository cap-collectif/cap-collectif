/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import Toggle from './Toggle'

const baseProps = {
  label: 'Click to toggle',
  className: 'mr-10',
  id: 'toggle-it',
  name: 'option',
  value: 'value of checkbox',
  onChange: jest.fn(),
  onBlur: jest.fn(),
  disabled: false,
  checked: false,
  labelSide: 'RIGHT',
  helpText: 'cool story bro',
}
const props = {
  basic: baseProps,
  disabled: { ...baseProps, disabled: true },
  noLabel: { ...baseProps, label: undefined },
  withTooltip: {
    ...baseProps,
    tooltip: {
      width: '12px',
      content: <p>CONTENT</p>,
    },
  },
}
describe('<Toggle />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<Toggle {...props.basic} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly when disabled', () => {
    const wrapper = shallow(<Toggle {...props.disabled} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly when not label', () => {
    const wrapper = shallow(<Toggle {...props.noLabel} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly with tooltip', () => {
    const wrapper = shallow(<Toggle {...props.withTooltip} />)
    expect(wrapper).toMatchSnapshot()
  })
})
