/* eslint-env mocha */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import ProposalDetailLikersTooltipLabel from './ProposalDetailLikersTooltipLabel';
import IntlData from '../../../translations/FR';

describe('<ProposalDetailLikersTooltipLabel />', () => {
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

  it('should render a tooltip with a formatted message when proposal has one liker', () => {
    const wrapper = shallow(<ProposalDetailLikersTooltipLabel proposal={proposalWithOneLiker} {...IntlData} />);
    expect(wrapper.find('FormattedMessage')).to.have.length(1);
  });

  it('should render a tooltip with two formatted message when proposal has several likers', () => {
    const wrapper = shallow(<ProposalDetailLikersTooltipLabel proposal={proposalWithSeveralLikers} {...IntlData} />);
    expect(wrapper.find('FormattedMessage')).to.have.length(1);
    expect(wrapper.find('br')).to.have.length(1);
    expect(wrapper.find('FormattedHTMLMessage')).to.have.length(1);
  });

  it('should render nothing when proposal has no likers', () => {
    const wrapper = shallow(<ProposalDetailLikersTooltipLabel proposal={proposalWithNoLikers} {...IntlData} />);
    expect(wrapper.children()).to.have.length(0);
  });
});
