// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalPageLastNews } from './ProposalPageLastNews';
import { $refType } from '../../../mocks';

describe('<ProposalPageLastNews />', () => {
  const proposal = {
    $refType,
    news: {
      totalCount: 1,
      edges: [{ node: { authors: [{}] } }],
    },
  };

  it('should render correctly', () => {
    // $FlowFixMe
    const wrapper = shallow(<ProposalPageLastNews proposal={proposal} />);
    expect(wrapper).toMatchSnapshot();
  });
});
