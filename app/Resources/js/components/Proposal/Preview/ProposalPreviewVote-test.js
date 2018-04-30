/* eslint-env jest */
// @flow
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalPreviewVote } from './ProposalPreviewVote';

describe('<ProposalPreviewVote />', () => {
  const proposal = {
    id: 'proposal1',
    votableStepId: 'step3',
    referer: 'http://capco.test',
    votesCountByStepId: {
      '2': 0,
    },
    commentsCount: 5,
    selections: [],
    votesByStepId: {
      selectionstep1: [],
      collectstep1: [],
    },
    viewerCanSeeEvaluation: true,
  };

  const props = {
    className: '',
    referer: 'http://capco.test',
  };

  it('should render a proposal preview vote', () => {
    const wrapper = shallow(<ProposalPreviewVote proposal={proposal} {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
