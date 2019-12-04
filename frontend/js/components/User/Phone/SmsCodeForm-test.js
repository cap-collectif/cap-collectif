// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';

import { SmsCodeForm } from './SmsCodeForm';

const props = {
  onSubmitSuccess: jest.fn(),
  submitting: false,
  handleSubmit: jest.fn(),
};

describe('<SmsCodeForm />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<SmsCodeForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
