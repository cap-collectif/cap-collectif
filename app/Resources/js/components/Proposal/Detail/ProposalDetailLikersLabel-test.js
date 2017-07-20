/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import ProposalDetailLikersLabel from './ProposalDetailLikersLabel';

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
    const wrapper = shallow(<ProposalDetailLikersLabel likers={oneLiker} />);
    expect(wrapper.find('Truncate').prop('children')).toEqual(
      oneLiker[0].displayName,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a <FormattedMessage/> when several likers', () => {
    const wrapper = shallow(
      <ProposalDetailLikersLabel likers={severalLikers} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render nothing when no likers', () => {
    const wrapper = shallow(<ProposalDetailLikersLabel likers={[]} />);
    expect(wrapper).toMatchSnapshot();
  });
});
