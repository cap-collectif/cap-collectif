// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import ProjectContentAdminPage from './ProjectContentAdminPage';

describe('<ProjectContentAdminPage />', () => {
  it('renders correctly', () => {
    const wrapper = shallow(<ProjectContentAdminPage project={null} />);
    expect(wrapper).toMatchSnapshot();
  });
});
