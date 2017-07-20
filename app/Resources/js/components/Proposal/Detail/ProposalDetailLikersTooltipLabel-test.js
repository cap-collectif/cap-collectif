/* eslint-env jest */
import React from 'react';
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
    expect(wrapper.find('FormattedMessage')).toHaveLength(1);
  });

  it('should render two formatted message when several likers', () => {
    const wrapper = shallow(<ProposalDetailLikersTooltipLabel likers={severalLikers} {...IntlData} />);
    expect(wrapper.find('FormattedMessage')).toHaveLength(1);
    expect(wrapper.find('FormattedMessage').prop('num')).toEqual(2);
    expect(wrapper.find('br')).toHaveLength(1);
    expect(wrapper.find('FormattedHTMLMessage')).toHaveLength(1);
    expect(wrapper.find('FormattedHTMLMessage').prop('message')).toEqual('user 1<br/>user 2');
  });

  it('should render nothing when no likers', () => {
    const wrapper = shallow(<ProposalDetailLikersTooltipLabel likers={[]} {...IntlData} />);
    expect(wrapper.children()).toHaveLength(0);
  });
});
