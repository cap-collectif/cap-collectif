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
      },
      $fragmentRefs,
      $refType,
    },
    features,
    step: {
      id: 'step1',
      voteThreshold: 2,
      voteType: 'SIMPLE',
      project: {
        opinionCanBeFollowed: true,
      },
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
