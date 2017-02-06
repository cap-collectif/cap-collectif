/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ConfirmPasswordModal } from './ConfirmPasswordModal';
import IntlData from '../../translations/FR';

describe('<ConfirmPasswordModal />', () => {
  it('should render an visible modal', () => {
    const wrapper = shallow(<ConfirmPasswordModal {...IntlData} show dispatch={() => {}} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('should render an hidden modal', () => {
    const wrapper = shallow(<ConfirmPasswordModal {...IntlData} show={false} dispatch={() => {}} />);
    expect(wrapper).toMatchSnapshot();
  });
});
