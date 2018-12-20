/* eslint-env jest */
/* @flow */
import React from 'react';
import { shallow } from 'enzyme';
import MapAdminPage from './MapAdminPage';

describe('<MapAdminPage/>', () => {
  it('should render', () => {
    const wrapper = shallow(<MapAdminPage />);
    expect(wrapper).toMatchSnapshot();
  });
});
