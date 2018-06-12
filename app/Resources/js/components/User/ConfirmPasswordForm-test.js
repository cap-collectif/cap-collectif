// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ConfirmPasswordForm } from './ConfirmPasswordForm';

describe('<ConfirmPasswordForm />', () => {
  it('should render', () => {
    const wrapper = shallow(<ConfirmPasswordForm handleSubmit={() => {}} />);
    expect(wrapper).toMatchSnapshot();
  });
});
