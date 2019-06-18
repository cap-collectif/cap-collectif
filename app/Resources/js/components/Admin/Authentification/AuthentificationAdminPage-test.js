// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { AuthentificationAdminPage } from './AuthentificationAdminPage';

describe('<AuthentificationAdminPage />', () => {
  it('renders correctly', () => {
    const wrapper = shallow(<AuthentificationAdminPage />);
    expect(wrapper).toMatchSnapshot();
  });
});
