/* eslint-env jest */
// @flow
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalListOrderSorting } from './ProposalListOrderSorting';
import { PROPOSAL_ORDER_RANDOM } from '../../../constants/ProposalConstants';
import { intlMock } from '../../../mocks';

const props = {
  orderByVotes: false,
  dispatch: jest.fn(),
  order: PROPOSAL_ORDER_RANDOM,
  defaultSort: PROPOSAL_ORDER_RANDOM,
  stepId: 'selectionstep1',
  intl: intlMock,
};

describe('<ProposalListOrderSorting />', () => {
  it('should render the list order sorting component', () => {
    const wrapper = shallow(<ProposalListOrderSorting {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
