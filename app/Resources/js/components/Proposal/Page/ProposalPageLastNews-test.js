// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalPageLastNews } from './ProposalPageLastNews';

describe('<ProposalPageLastNews />', () => {
  const proposal = {
    posts: [{ authors: [{}] }]
  };

  it('should render correctly', () => {
    const wrapper = shallow(<ProposalPageLastNews proposal={proposal} />);
    expect(wrapper).toMatchSnapshot();
  });
});
