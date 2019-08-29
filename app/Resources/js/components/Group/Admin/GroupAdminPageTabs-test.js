// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { GroupAdminPageTabs } from './GroupAdminPageTabs';
import { intlMock } from '../../../mocks';

describe('<GroupAdminPageTabs />', () => {
  const props = {
    intl: intlMock,
    // $FlowFixMe $refType
    group: {},
  };

  it('render correctly', () => {
    const wrapper = shallow(<GroupAdminPageTabs {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
