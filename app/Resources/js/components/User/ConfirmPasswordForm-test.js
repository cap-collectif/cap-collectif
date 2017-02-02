/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ConfirmPasswordForm } from './ConfirmPasswordForm';
import IntlData from '../../translations/FR';

describe('<ConfirmPasswordForm />', () => {
  it('should render', () => {
    const wrapper = shallow(<ConfirmPasswordForm {...IntlData} handleSubmit={() => {}} />);
    expect(wrapper).toMatchSnapshot();
  });
});
