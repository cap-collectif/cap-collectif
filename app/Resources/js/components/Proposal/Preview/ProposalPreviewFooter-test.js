/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import ProposalPreviewFooter from './ProposalPreviewFooter';

describe('<ProposalPreviewFooter />', () => {
  const proposal = {
    commentsCount: 3,
    votesCountByStepId: {
      '1': 1,
      '42': 5,
    },
  };

  const props = {
    proposal,
    stepId: '1',
    showComments: true,
  };

  it('should render a footer with comment counter', () => {
    const wrapper = shallow(<ProposalPreviewFooter {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a footer with comment and votes counters', () => {
    const wrapper = shallow(<ProposalPreviewFooter {...props} showVotes />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a footer without comment and votes counters', () => {
    const wrapper = shallow(
      <ProposalPreviewFooter {...props} showVotes={false} showComments={false} />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
