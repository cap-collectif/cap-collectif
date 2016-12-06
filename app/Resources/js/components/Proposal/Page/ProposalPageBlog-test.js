/* eslint-env jest */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { ProposalPageBlog } from './ProposalPageBlog';
import IntlData from '../../../translations/FR';

describe('<ProposalPageBlog />', () => {
  const proposal = {
    posts: [
      {},
      {},
    ],
  };

  it('should render a list of posts', () => {
    const wrapper = shallow(<ProposalPageBlog dispatch={() => {}} proposal={proposal} {...IntlData} />);
    expect(wrapper.find('Connect(Post)')).to.have.length(proposal.posts.length);
  });

  it('should render a text if no posts', () => {
    const wrapper = shallow(<ProposalPageBlog dispatch={() => {}} proposal={{ posts: [] }} {...IntlData} />);
    expect(wrapper.text()).to.equal(IntlData.messages.proposal.no_posts);
  });
});
