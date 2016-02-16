/* eslint-env mocha */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import ProposalDetailLikersLabel from './ProposalDetailLikersLabel';
import IntlData from '../../../translations/FR';

describe('<ProposalDetailLikersLabel />', () => {
  const proposalWithOneLiker = {
    likers: [
      {
        displayName: 'user',
      },
    ],
  };
  const proposalWithLongNameLiker = {
    likers: [
      {
        displayName: 'user with a very long name that need to be truncated',
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

  it('should render a string with liker name when proposal has one liker', () => {
    const wrapper = shallow(<ProposalDetailLikersLabel proposal={proposalWithOneLiker} {...IntlData} />);
    expect(wrapper.text()).to.equal('user');
  });

  it('should render a string with truncated liker name when proposal has one liker with a long name', () => {
    const wrapper = shallow(<ProposalDetailLikersLabel proposal={proposalWithLongNameLiker} {...IntlData} />);
    expect(wrapper.text()).to.equal('user with a very long name tha...');
  });

  it('should render a FormattedMessage when proposal has several likers', () => {
    const wrapper = shallow(<ProposalDetailLikersLabel proposal={proposalWithSeveralLikers} {...IntlData} />);
    expect(wrapper.find('FormattedMessage')).to.have.length(1);
    expect(wrapper.find('FormattedMessage').prop('num')).to.equals(2);
  });

  it('should render nothing when proposal has no likers', () => {
    const wrapper = shallow(<ProposalDetailLikersLabel proposal={proposalWithNoLikers} {...IntlData} />);
    expect(wrapper.children()).to.have.length(0);
  });
});
