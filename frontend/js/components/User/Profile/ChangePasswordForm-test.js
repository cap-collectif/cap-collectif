/* eslint-env jest */
/* @flow */
import React from 'react';
import { shallow } from 'enzyme';
import { ChangePasswordForm } from './ChangePasswordForm';
import { intlMock, formMock, $refType } from '~/mocks';
import { features } from '~/redux/modules/default';

describe('<ChangePasswordForm />', () => {
  const props = {
    ...formMock,
    intl: intlMock,
    features,
    viewer: {
      $refType,
      isFranceConnectAccount: false,
    },
  };

  it('should render', () => {
    const wrapper = shallow(<ChangePasswordForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('should render connected with france connect', () => {
    const ownProps = {
      ...props,
      features: {
        ...features,
        login_franceconnect: true,
      },
      viewer: {
        $refType,
        isFranceConnectAccount: true,
      },
    };
    const wrapper = shallow(<ChangePasswordForm {...ownProps} />);
    expect(wrapper).toMatchSnapshot();
  });
});
