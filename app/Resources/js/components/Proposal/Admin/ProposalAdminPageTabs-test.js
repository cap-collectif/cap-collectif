// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalAdminPageTabs } from './ProposalAdminPageTabs';
import { intlMock } from '../../../mocks';

describe('<ProposalAdminPageTabs />', () => {
  const props = {
    intl: intlMock,
    proposal: {},
  };

  it('render correctly', () => {
    const wrapper = shallow(<ProposalAdminPageTabs {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
