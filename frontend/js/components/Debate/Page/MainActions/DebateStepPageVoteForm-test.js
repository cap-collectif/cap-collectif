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
  };

  it('renders correcty', () => {
    const wrapper = shallow(<DebateStepPageVoteForm {...props} voteState="NONE" debate={debate} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('renders correcty when voted', () => {
    const wrapper = shallow(
      <DebateStepPageVoteForm {...props} voteState="VOTED" debate={debate} />,
    );
    expect(wrapper).toMatchSnapshot();
  });
  it('renders correcty when argumented', () => {
    const wrapper = shallow(
      <DebateStepPageVoteForm {...props} voteState="ARGUMENTED" debate={debate} />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
