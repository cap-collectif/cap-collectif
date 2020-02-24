// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalUserVoteItem } from './ProposalUserVoteItem';
import { $refType, $fragmentRefs, intlMock } from '../../../mocks';

describe('<ProposalUserVoteItem />', () => {
  const vote = {
    $refType,
    $fragmentRefs,
    published: true,
    createdAt: '2015-01-01 00:00:00',
    proposal: {
      id: '1',
      $fragmentRefs,
      title: 'proposal',
      url: 'http://capco.test/proposal',
    },
  };
  const step = {
    id: '1',
    open: true,
    votesRanking: false,
    voteType: 'SIMPLE',
    form: {
      isProposalForm: false,
    },
    project: {
      type: {
        title: 'global.consultation',
      },
    },
    $refType,
  };

  const props = {
    intl: intlMock,
    onDelete: jest.fn(),
  };

  it('should render a vote item', () => {
    const wrapper = shallow(
      <ProposalUserVoteItem
        isVoteVisibilityPublic
        member="votes.1"
        {...props}
        step={step}
        vote={vote}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  const stepInterpellation = {
    id: '1',
    open: true,
    votesRanking: false,
    voteType: 'SIMPLE',
    form: {
      isProposalForm: true,
    },
    project: {
      type: {
        title: 'project.types.interpellation',
      },
    },
    $refType,
  };

  it('should render a support item', () => {
    const wrapper = shallow(
      <ProposalUserVoteItem
        isVoteVisibilityPublic
        member="votes.1"
        {...props}
        step={stepInterpellation}
        vote={vote}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  const voteInterpellation = {
    $refType,
    $fragmentRefs,
    published: true,
    createdAt: '',
    proposal: {
      id: '1',
      $fragmentRefs,
      title: 'proposal',
      url: 'http://capco.test/proposal',
    },
  };

  it('should render a support item without createdAt', () => {
    const wrapper = shallow(
      <ProposalUserVoteItem
        isVoteVisibilityPublic
        member="votes.1"
        {...props}
        step={stepInterpellation}
        vote={voteInterpellation}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
