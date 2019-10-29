// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import ProjectMetadataAdminPage from './ProjectMetadataAdminPage';

describe('<ProjectMetadataAdminPage />', () => {
  it('renders correctly', () => {
    const wrapper = shallow(<ProjectMetadataAdminPage project={null} />);
    expect(wrapper).toMatchSnapshot();
  });
});