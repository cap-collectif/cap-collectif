// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { DebateVoteItem } from './DebateVoteItem';
import { $refType } from '~/mocks';

describe('<DebateVoteItem />', () => {
  const defaultProps = {
    vote: {
      $refType,
      id: '51',
      type: 'FOR',
      publishedAt: '2018-04-09T23:21:06+0200',
      debate: {
        id: 'user1',
        url: 'https://capco.dev/profile/lbrunet',
        step: {
          id: 'stepId',
          title: 'Pour ou contre',
        },
      },
    },
  };

  const voteAgainstProps = {
    vote: {
      ...defaultProps.vote,
      type: 'AGAINST',
    },
  };

  it('renders correcty for vote for', () => {
    const wrapper = shallow(<DebateVoteItem {...defaultProps} />);

    expect(wrapper).toMatchSnapshot();
  });

  it('renders correcty for vote against', () => {
    const wrapperAgainst = shallow(<DebateVoteItem {...voteAgainstProps} />);

    expect(wrapperAgainst).toMatchSnapshot();
  });
});
