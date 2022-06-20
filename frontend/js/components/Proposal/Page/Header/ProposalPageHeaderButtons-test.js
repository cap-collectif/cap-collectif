/* eslint-env jest */
// @flow
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalPageHeaderButtons } from './ProposalPageHeaderButtons';
import { $refType, $fragmentRefs } from '~/mocks';

describe('<ProposalPageHeaderButtons />', () => {
  const proposal = {
    $refType,
    $fragmentRefs,
    id: 'proposalId',
    url: '/slash',
    title: 'OEEEEE',
    pendingRevisions: {
      totalCount: 0,
    },
    author: {
      id: 'authorid',
      slug: 'metal',
      displayName: 'flex',
    },
    contribuable: true,
    form: {
      contribuable: true,
      canContact: true,
    },
    publicationStatus: 'PUBLISHED',
    currentVotableStep: {
      id: 'stepid',
    },
  };

  const props = {
    dispatch: jest.fn(),
  };

  it('should render correctly', () => {
    const wrapper = shallow(
      <ProposalPageHeaderButtons step={null} proposal={proposal} viewer={null} {...props} />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
