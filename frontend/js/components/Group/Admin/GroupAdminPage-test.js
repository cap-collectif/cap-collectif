// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { GroupAdminPage } from './GroupAdminPage';

describe('<GroupAdminPage />', () => {
  const props = {
    groupId: 'group4',
  };

  it('render correctly', () => {
    const wrapper = shallow(<GroupAdminPage {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
