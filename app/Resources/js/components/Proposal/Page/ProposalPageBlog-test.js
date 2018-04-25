// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalPageBlog } from './ProposalPageBlog';
import { $refType, $fragmentRefs } from '../../../mocks';

describe('<ProposalPageBlog />', () => {
  const proposal = {
    $refType,
    news: {
      totalCount: 2,
      edges: [{ node: { $fragmentRefs } }, { node: { $fragmentRefs } }],
    },
  };

  it('should render a list of posts', () => {
    const wrapper = shallow(<ProposalPageBlog proposal={proposal} />);
    expect(wrapper).toMatchSnapshot();
  });

  const proposalWithoutPosts = {
    $refType,
    news: {
      totalCount: 0,
      edges: [],
    },
  };
  it('should render a text if no posts', () => {
    const wrapper = shallow(<ProposalPageBlog proposal={proposalWithoutPosts} />);
    expect(wrapper).toMatchSnapshot();
  });
});
