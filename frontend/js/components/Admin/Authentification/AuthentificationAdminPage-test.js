// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { AuthentificationAdminPage } from './AuthentificationAdminPage';
import { features } from '~/redux/modules/default';

describe('<AuthentificationAdminPage />', () => {
  it('renders correctly', () => {
    const Props = {
      features,
    };

    const wrapper = shallow(<AuthentificationAdminPage {...Props} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('renders correctly FC enabled', () => {
    const Props = {
      features: {
        ...features,
        login_franceconnect: true
      }
    };

    const wrapper = shallow(<AuthentificationAdminPage {...Props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
