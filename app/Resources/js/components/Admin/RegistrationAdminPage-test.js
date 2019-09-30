// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { RegistrationAdminPage } from './RegistrationAdminPage';
import { features } from '../../redux/modules/default';

describe('<RegistrationAdminPage />', () => {
  const props = {
    isSuperAdmin: true,
    features: {
      ...features,
    },
    onToggle: jest.fn(),
  };

  it('renders correctly', () => {
    const wrapper = shallow(<RegistrationAdminPage {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly when not super admin', () => {
    const wrapper = shallow(<RegistrationAdminPage {...props} isSuperAdmin={false} />);
    expect(wrapper).toMatchSnapshot();
  });
});
