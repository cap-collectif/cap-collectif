// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { DebateStepPageVote } from './DebateStepPageVote';

describe('<DebateStepPageVote/>', () => {
  it('renders correcty', () => {
    const wrapper = shallow(
      <DebateStepPageVote isAuthenticated debateId="debateId" onSuccess={jest.fn()} />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
