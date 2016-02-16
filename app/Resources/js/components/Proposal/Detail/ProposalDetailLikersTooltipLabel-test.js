/* eslint-env mocha */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import ProposalDetailLikersTooltipLabel from './ProposalDetailLikersTooltipLabel';
import IntlData from '../../../translations/FR';

describe('<ProposalDetailLikersTooltipLabel />', () => {
  const oneLiker = [
    {
      displayName: 'user',
    },
  ];

  const severalLikers = [
    {
      displayName: 'user 1',
    },
    {
      displayName: 'user 2',
    },
  ];

  it('should render a formatted message when one liker', () => {
    const wrapper = shallow(<ProposalDetailLikersTooltipLabel likers={oneLiker} {...IntlData} />);
    expect(wrapper.find('FormattedMessage')).to.have.length(1);
  });

  it('should render two formatted message when several likers', () => {
    const wrapper = shallow(<ProposalDetailLikersTooltipLabel likers={severalLikers} {...IntlData} />);
    expect(wrapper.find('FormattedMessage')).to.have.length(1);
    expect(wrapper.find('FormattedMessage').prop('num')).to.equal(2);
    expect(wrapper.find('br')).to.have.length(1);
    expect(wrapper.find('FormattedHTMLMessage')).to.have.length(1);
    expect(wrapper.find('FormattedHTMLMessage').prop('message')).to.equal('user 1<br/>user 2');
  });

  it('should render nothing when no likers', () => {
    const wrapper = shallow(<ProposalDetailLikersTooltipLabel likers={[]} {...IntlData} />);
    expect(wrapper.children()).to.have.length(0);
  });
});
