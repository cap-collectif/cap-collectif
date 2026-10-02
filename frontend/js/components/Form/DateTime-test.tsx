/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import DateTime from './DateTime'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<DateTime />', () => {
  const props = {
    dateTimeInputProps: {
      id: 'datePicker',
      placeholder: 'placeholderDatePicker',
      disabled: false,
      required: false,
      name: 'Nameuh',
      className: 'classssss',
    },
    onChange: jest.fn,
  }
  it('should render correctly', () => {
    const wrapper = shallow(<DateTime {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
