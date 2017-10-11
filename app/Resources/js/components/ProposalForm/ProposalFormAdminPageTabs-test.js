// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalFormAdminPageTabs } from './ProposalFormAdminPageTabs';

describe('<ProposalFormAdminPageTabs />', () => {
  const props = {
    intl: global.intlMock,
    proposalForm: { url: 'http://capco.dev/top-budget', reference: '2' },
  };

  it('render correctly', () => {
    const wrapper = shallow(<ProposalFormAdminPageTabs {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
