/* eslint-env mocha */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import ProposalDetailLikers from './ProposalDetailLikers';

describe('<ProposalDetailLikers />', () => {
  const proposalWithOneLiker = {
    likers: [
      {
        displayName: 'user',
      },
    ],
  };
  const proposalWithSeveralLikers = {
    likers: [
      {
        displayName: 'user 1',
      },
      {
        displayName: 'user 2',
      },
    ],
  };
  const proposalWithNoLikers = {
    likers: [],
  };

  it('should render a span with class proposal__info when proposal has one liker', () => {
    const wrapper = shallow(<ProposalDetailLikers proposal={proposalWithOneLiker} />);
    expect(wrapper.find('span.proposal__info')).to.have.length(1);
  });

  it('should render a span with class proposal__info when proposal has several likers', () => {
    const wrapper = shallow(<ProposalDetailLikers proposal={proposalWithSeveralLikers} />);
    expect(wrapper.find('span.proposal__info')).to.have.length(1);
  });

  it('should not render a span with class proposal_info when proposal has no likers', () => {
    const wrapper = shallow(<ProposalDetailLikers proposal={proposalWithNoLikers} />);
    expect(wrapper.find('span.proposal__info')).to.not.exists;
  });
});
