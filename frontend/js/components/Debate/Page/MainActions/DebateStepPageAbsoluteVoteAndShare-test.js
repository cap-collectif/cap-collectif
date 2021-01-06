// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { DebateStepPageAbsoluteVoteAndShare } from './DebateStepPageAbsoluteVoteAndShare';
import { $refType, $fragmentRefs } from '~/mocks';

describe('<DebateStepPageAbsoluteVoteAndShare/>', () => {
  const debate = {
    id: 'debate1',
    $refType,
    $fragmentRefs,
    votes: { totalCount: 5 },
    yesVotes: { totalCount: 4 },
  };

  const props = {
    title: 'Pour ou contre le LSD dans nos cantines',
    body: 'Oui je suis pour',
    isAuthenticated: true,
    showArgumentForm: true,
    setVoteState: jest.fn(),
    setShowArgumentForm: jest.fn(),
    url: '/debate1',
    viewerHasArgument: false,
  };

  it('renders correcty', () => {
    const wrapper = shallow(
      <DebateStepPageAbsoluteVoteAndShare {...props} voteState="NONE" debate={debate} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correcty when voted', () => {
    const wrapper = shallow(
      <DebateStepPageAbsoluteVoteAndShare {...props} voteState="VOTED" debate={debate} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correcty when argumented', () => {
    const wrapper = shallow(
      <DebateStepPageAbsoluteVoteAndShare
        {...props}
        viewerHasArgument
        voteState="ARGUMENTED"
        debate={debate}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
