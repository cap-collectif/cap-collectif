/* eslint-env jest */
/* @Flow */
import React from 'react';
import { shallow } from 'enzyme';
import { ChangePasswordForm } from './ChangePasswordForm';
import { intlMock } from '../../../mocks';

describe('<ChangePasswordForm />', () => {
  const props = {
    intl: intlMock,
  };

  it('should render', () => {
    const wrapper = shallow(<ChangePasswordForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
