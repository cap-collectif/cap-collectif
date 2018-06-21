/* eslint-env jest */
/* @flow */
import React from 'react';
import { shallow } from 'enzyme';
import DateDropdownPicker from './DateDropdownPicker';

describe('<DateDropdownPicker />', () => {
  const props = {
    dayDefaultValue: 'Day',
    dayId: 'day',
    monthDefaultValue: 'month',
    monthId: 'month',
    yearDefaultValue: 'year',
    yearId: 'year',
    formName: 'myFormName',
    input: { value: '1990-04-25', onChange: () => {} },
    label: 'my-label-id',
    componentId: 'myId',
    labelClassName: 'sm-3',
    divClassName: 'className',
    globalClassName: 'globalClassName',
  };

  it('should render in english without date and disabled', () => {
    const wrapper = shallow(<DateDropdownPicker {...props} disabled />);
    wrapper.setState({
      year: null,
      month: null,
      day: null,
    });
    expect(wrapper).toMatchSnapshot();
  });

  it('should render in english with date', () => {
    const wrapper = shallow(<DateDropdownPicker {...props} disabled={false} />);
    wrapper.setState({
      year: '1990',
      month: '04',
      day: '25',
    });
    expect(wrapper).toMatchSnapshot();
  });
});
