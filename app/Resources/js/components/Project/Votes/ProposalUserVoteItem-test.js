/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalUserVoteItem } from './ProposalUserVoteItem';
import IntlData from '../../../translations/FR';

describe('<ProposalUserVoteItem />', () => {
  const props = {
    dispatch: () => {},
    proposal: {
      id: 1,
      title: 'proposal',
      district: {
        name: 'district',
      },
      _links: {
        show: 'http://capco.test/proposal',
      },
      author: {
        id: 1,
        displayName: 'user',
      },
    },
    step: {
      id: 1,
      voteType: 2,
      open: true,
    },
    ...IntlData,
  };

  it('should render a vote item', () => {
    const wrapper = shallow(<ProposalUserVoteItem {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
