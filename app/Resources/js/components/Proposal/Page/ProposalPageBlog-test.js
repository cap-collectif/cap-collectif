/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalPageBlog } from './ProposalPageBlog';

describe('<ProposalPageBlog />', () => {
  const proposal = {
    posts: [{}, {}],
  };

  it('should render a list of posts', () => {
    const wrapper = shallow(<ProposalPageBlog dispatch={() => {}} proposal={proposal} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a text if no posts', () => {
    const wrapper = shallow(<ProposalPageBlog dispatch={() => {}} proposal={{ posts: [] }} />);
    expect(wrapper).toMatchSnapshot();
  });
});
