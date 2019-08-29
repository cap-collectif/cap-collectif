// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalFormAdminPageTabs } from './ProposalFormAdminPageTabs';
import { $fragmentRefs, intlMock, $refType } from '../../mocks';

describe('<ProposalFormAdminPageTabs />', () => {
  const props = {
    intl: intlMock,
    proposalForm: {
      $refType,
      $fragmentRefs,
      url: 'http://capco.dev/top-budget',
      reference: '2',
    },
  };

  it('render correctly', () => {
    const wrapper = shallow(<ProposalFormAdminPageTabs {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
