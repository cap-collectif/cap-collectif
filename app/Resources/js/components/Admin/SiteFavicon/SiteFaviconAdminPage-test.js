// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { SiteFaviconAdminPage } from './SiteFaviconAdminPage';

describe('<SiteFaviconAdminPage />', () => {
  it('renders correctly', () => {
    const wrapper = shallow(<SiteFaviconAdminPage />);
    expect(wrapper).toMatchSnapshot();
  });
});
