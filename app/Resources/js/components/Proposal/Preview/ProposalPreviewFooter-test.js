// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalPreviewFooter } from './ProposalPreviewFooter';
import { $refType } from '../../../mocks';

describe('<ProposalPreviewFooter />', () => {
  const proposal = {
    $refType,
    id: '1',
    commentsCount: 3,
    votes: {
      totalCount: 42,
    },
  };

  it('should render a footer with comment counter', () => {
    const wrapper = shallow(<ProposalPreviewFooter proposal={proposal} />);
    expect(wrapper).toMatchSnapshot();
  });

  // it('should render a footer with comment and votes counters', () => {
  //   const wrapper = shallow(<ProposalPreviewFooter {...props} showVotes />);
  //   expect(wrapper).toMatchSnapshot();
  // });
  //
  // it('should render a footer without comment and votes counters', () => {
  //   const wrapper = shallow(
  //     <ProposalPreviewFooter {...props} showVotes={false} showComments={false} />,
  //   );
  //   expect(wrapper).toMatchSnapshot();
  // });
});
