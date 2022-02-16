/* eslint-env jest */
// @flow
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalPreviewBody } from './ProposalPreviewBody';
import { $refType, $fragmentRefs } from '../../../mocks';
import { features } from '../../../redux/modules/default';

describe('<ProposalPreviewBody />', () => {
  const props = {
    proposal: {
      id: 'proposal1',
      slug: 'proposal-title',
      title: 'proposalTitle',
      trashed: false,
      trashedStatus: 'INVISIBLE',
      url: 'http://plateform/project1/step1/proposal1',
      summaryOrBodyExcerpt: 'summaryOrBodyExcerpt',
      media: {
        url: 'http://image.png',
        name: 'media1',
      },
      district: {
        name: 'district9',
      },
      theme: {
        title: 'themeI',
      },
      category: {
        name: 'string',
      },
      currentVotableStep: {
        id: 'step1',
        votesRanking: true,
      },
      form: {
        objectType: 'PROPOSAL',
      },
      $fragmentRefs,
      $refType,
    },
    features,
    step: {
      id: 'step1',
      url: '/step',
      voteThreshold: 2,
      voteType: 'SIMPLE',
      project: {
        opinionCanBeFollowed: true,
      },
      canDisplayBallot: true,
      $fragmentRefs,
      $refType,
    },
    viewer: {
      $fragmentRefs,
      $refType,
    },
  };

  it('should render a proposal preview', () => {
    const wrapper = shallow(<ProposalPreviewBody {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
