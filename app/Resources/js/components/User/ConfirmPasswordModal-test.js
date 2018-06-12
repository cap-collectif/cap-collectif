// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ConfirmPasswordModal } from './ConfirmPasswordModal';

describe('<ConfirmPasswordModal />', () => {
  it('should render an visible modal', () => {
    const wrapper = shallow(<ConfirmPasswordModal show dispatch={jest.fn()} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('should render an hidden modal', () => {
    const wrapper = shallow(<ConfirmPasswordModal show={false} dispatch={jest.fn()} />);
    expect(wrapper).toMatchSnapshot();
  });
});
