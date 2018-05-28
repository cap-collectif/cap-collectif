/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import ProposalDetailLikersTooltipLabel from './ProposalDetailLikersTooltipLabel';

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
    const wrapper = shallow(<ProposalDetailLikersTooltipLabel likers={oneLiker} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render two formatted message when several likers', () => {
    const wrapper = shallow(<ProposalDetailLikersTooltipLabel likers={severalLikers} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render nothing when no likers', () => {
    const wrapper = shallow(<ProposalDetailLikersTooltipLabel likers={[]} />);
    expect(wrapper.children()).toHaveLength(0);
    expect(wrapper).toMatchSnapshot();
  });
});
