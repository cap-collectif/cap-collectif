/* eslint-env jest */
// @flow
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalPageHeader } from './ProposalPageHeader';
import { $refType, $fragmentRefs } from '../../../mocks';

describe('<ProposalPageHeader />', () => {
  const proposal = {
    $refType,
    $fragmentRefs,
    id: '1',
    title: 'titre',
    currentVotableStep: {
      id: 'step1',
      open: true,
    },
    theme: {
      title: 'titre du theme',
    },
    author: {
      username: 'userAdmin',
      displayName: 'userAdmin',
      media: {
        url: 'http://media.url',
      },
    },
    createdAt: '2015-01-01 00:00:00',
    updatedAt: '2015-01-05 00:00:00',
    publicationStatus: 'PUBLISHED',
    show_url: 'true',
  };

  const proposalWithoutTheme = {
    $refType,
    $fragmentRefs,
    id: '1',
    title: 'titre',
    theme: null,
    currentVotableStep: {
      id: 'step1',
      open: true,
    },
    author: {
      username: 'userAdmin',
      displayName: 'userAdmin',
      media: {
        url: 'http://media.url',
      },
    },
    createdAt: '2015-01-01 00:00:00',
    updatedAt: '2015-01-05 00:00:00',
    publicationStatus: 'PUBLISHED',
    show_url: 'true',
  };

  const props = {
    className: '',
    referer: 'http://capco.test',
  };

  it('should render a proposal header', () => {
    const wrapper = shallow(<ProposalPageHeader proposal={proposal} isAuthenticated {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should not render theme if proposal has none', () => {
    const wrapper = shallow(
      <ProposalPageHeader proposal={proposalWithoutTheme} isAuthenticated {...props} />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
