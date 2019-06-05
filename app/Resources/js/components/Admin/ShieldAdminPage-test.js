// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ShieldAdminPage } from './ShieldAdminPage';

describe('<RegistrationAdminPage />', () => {
  it('renders correctly', () => {
    const wrapper = shallow(<ShieldAdminPage />);
    expect(wrapper).toMatchSnapshot();
  });
});
