// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { DebateStepPageVoteForm } from './DebateStepPageVoteForm';
import { $refType } from '~/mocks';

describe('<DebateStepPageVoteForm/>', () => {
  const debate = {
    id: 'debate1',
    $refType,
  };

  const props = {
    body: 'Oui je suis pour',
    showArgumentForm: true,
    setVoteState: jest.fn(),
    setShowArgumentForm: jest.fn(),
    viewerIsConfirmed: true,
    organizationName: 'CapCollectif',
  };

  it('should renders correctly', () => {
    const wrapper = shallow(<DebateStepPageVoteForm {...props} voteState="NONE" debate={debate} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should renders correctly on mobile', () => {
    const wrapper = shallow(
      <DebateStepPageVoteForm {...props} voteState="NONE" debate={debate} isMobile />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should renders correctly when voted', () => {
    const wrapper = shallow(
      <DebateStepPageVoteForm {...props} voteState="VOTED" debate={debate} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should renders correctly when voted on mobile', () => {
    const wrapper = shallow(
      <DebateStepPageVoteForm {...props} voteState="VOTED" debate={debate} isMobile />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should renders correctly when argumented', () => {
    const wrapper = shallow(
      <DebateStepPageVoteForm {...props} voteState="ARGUMENTED" debate={debate} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should renders correctly when argumented on mobile', () => {
    const wrapper = shallow(
      <DebateStepPageVoteForm {...props} voteState="ARGUMENTED" debate={debate} isMobile />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
