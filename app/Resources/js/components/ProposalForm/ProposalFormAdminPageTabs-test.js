// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalFormAdminPageTabs } from './ProposalFormAdminPageTabs';
import { intlMock } from '../../mocks';

describe('<ProposalFormAdminPageTabs />', () => {
  const props = {
    intl: intlMock,
    // $FlowFixMe $refType
    proposalForm: {
      url: 'http://capco.dev/top-budget',
      reference: '2',
    },
  };

  it('render correctly', () => {
    const wrapper = shallow(<ProposalFormAdminPageTabs {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
