// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalAdminPageTabs } from './ProposalAdminPageTabs';

describe('<ProposalAdminPageTabs />', () => {
  const props = {
    intl: global.intlMock,
    proposal: {},
  };

  it('render correctly', () => {
    const wrapper = shallow(<ProposalAdminPageTabs {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
