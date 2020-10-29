/* eslint-env jest */
/* @flow */
import React from 'react';
import { shallow } from 'enzyme';
import DateTime from './DateTime';

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
  };

  it('should render correctly', () => {
    const wrapper = shallow(<DateTime {...props} />);

    expect(wrapper).toMatchSnapshot();
  });
});
