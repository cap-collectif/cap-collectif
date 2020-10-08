/* eslint-env jest */
// @flow
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalPageHeader } from './ProposalPageHeader';
import { $refType, $fragmentRefs } from '~/mocks';

describe('<ProposalPageHeader />', () => {
  const proposal = {
    $refType,
    $fragmentRefs,
    id: '1',
    title: 'titre',
    theme: { title: 'titre du theme' },
    author: {
      $fragmentRefs,
      username: 'userAdmin',
    },
    publishedAt: '2015-01-01 00:00:00',
    createdAt: '2015-01-01 00:00:00',
    updatedAt: '2015-01-05 00:00:00',
    url: 'true',
    draft: false,
    project: { type: { title: 'global.consultation' } },
    form: {
      isProposalForm: true,
      canContact: false,
    },
    media: { url: '/image.exe' },
    category: {
      name: 'cat',
      categoryImage: {
        image: {
          url: './',
        },
      },
    },
  };

  const proposalWithoutTheme = {
    $refType,
    $fragmentRefs,
    id: '1',
    title: 'titre',
    theme: null,
    author: {
      $fragmentRefs,
      username: 'userAdmin',
    },
    createdAt: '2015-01-01 00:00:00',
    publishedAt: '2015-01-01 00:00:00',
    updatedAt: '2015-01-05 00:00:00',
    url: 'true',
    draft: false,
    project: { type: { title: 'global.consultation' } },
    form: {
      isProposalForm: false,
      canContact: false,
    },
    media: null,
    category: null,
  };

  const proposalInDraft = {
    $refType,
    $fragmentRefs,
    id: '1',
    title: 'titre',
    theme: null,
    author: {
      $fragmentRefs,
      username: 'userAdmin',
    },
    createdAt: '2015-01-01 00:00:00',
    publishedAt: null,
    updatedAt: '2015-01-05 00:10:00',
    draft: true,
    url: 'true',
    project: { type: { title: 'global.consultation' } },
    form: {
      isProposalForm: false,
      canContact: false,
    },
    media: null,
    category: null,
  };

  const props = {
    className: '',
    referer: 'http://capco.test',
    title: 'Titre',
    opinionCanBeFollowed: true,
    hasVotableStep: true,
  };

  it('should render a proposal header as ProposalFrom', () => {
    const wrapper = shallow(
      <ProposalPageHeader step={null} proposal={proposal} viewer={null} {...props} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a proposal header as ProposalFrom with an analysing button', () => {
    const wrapper = shallow(
      <ProposalPageHeader
        hasAnalysingButton
        step={null}
        proposal={proposal}
        viewer={null}
        {...props}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should not render theme if proposal has none and form type is question', () => {
    const wrapper = shallow(
      <ProposalPageHeader proposal={proposalWithoutTheme} step={null} viewer={null} {...props} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a proposal in draft', () => {
    const wrapper = shallow(
      <ProposalPageHeader proposal={proposalInDraft} step={null} viewer={null} {...props} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  const interpellation = {
    $refType,
    $fragmentRefs,
    id: '1',
    title: 'titre',
    theme: { title: 'titre du theme' },
    author: {
      $fragmentRefs,
      username: 'userAdmin',
    },
    publishedAt: '2015-01-01 00:00:00',
    createdAt: '2015-01-01 00:00:00',
    updatedAt: '2015-01-05 00:00:00',
    url: 'true',
    draft: false,
    project: { type: { title: 'project.types.interpellation' } },
    form: {
      isProposalForm: true,
      canContact: false,
    },
    media: null,
    category: null,
  };

  it('should render an interpellation', () => {
    const wrapper = shallow(
      <ProposalPageHeader proposal={interpellation} step={null} viewer={null} {...props} />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
