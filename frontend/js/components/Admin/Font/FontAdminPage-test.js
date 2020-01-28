// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { FontAdminPage } from './FontAdminPage';

describe('<FontAdminPage />', () => {
  it('renders correctly', () => {
    const wrapper = shallow(<FontAdminPage />);
    expect(wrapper).toMatchSnapshot();
  });
});
