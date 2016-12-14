/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import ProposalDetailLikersLabel from './ProposalDetailLikersLabel';
import IntlData from '../../../translations/FR';

describe('<ProposalDetailLikersLabel />', () => {
  const oneLiker = [
    {
      displayName: 'user with a very long name that need to be truncated',
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

  it('should render truncated liker name when only one liker', () => {
    const wrapper = shallow(<ProposalDetailLikersLabel likers={oneLiker} {...IntlData} />);
    expect(wrapper.find('Truncate').prop('children')).toEqual(oneLiker[0].displayName);
  });

  it('should render a <FormattedMessage/> when several likers', () => {
    const wrapper = shallow(<ProposalDetailLikersLabel likers={severalLikers} {...IntlData} />);
    expect(wrapper.find('FormattedMessage')).toHaveLength(1);
    expect(wrapper.find('FormattedMessage').prop('num')).toEqual(2);
  });

  it('should render nothing when no likers', () => {
    const wrapper = shallow(<ProposalDetailLikersLabel likers={[]} {...IntlData} />);
    expect(wrapper.children()).toHaveLength(0);
  });
});
