// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { GroupAdminPageTabs } from './GroupAdminPageTabs';

describe('<GroupAdminPageTabs />', () => {
  const props = {
    intl: global.intlMock,
    group: {},
  };

  it('render correctly', () => {
    const wrapper = shallow(<GroupAdminPageTabs {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
