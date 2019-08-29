// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { GroupAdminPageTabs } from './GroupAdminPageTabs';
import { intlMock, $fragmentRefs, $refType } from '../../../mocks';

describe('<GroupAdminPageTabs />', () => {
  const props = {
    intl: intlMock,
    group: { $fragmentRefs, $refType },
  };

  it('render correctly', () => {
    const wrapper = shallow(<GroupAdminPageTabs {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
