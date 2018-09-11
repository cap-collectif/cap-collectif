// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { cloneDeep } from 'lodash';
import { VoteItem } from './VoteItem';
import { $refType } from '../../mocks';

describe('<VoteItem />', () => {
  const defaultProps = {
    vote: {
      $refType,
      id: '51',
      kind: 'vote',
      value: 1,
      createdAt: '2018-04-09T23:21:06+0200',
      author: {
        id: 'user1',
        slug: 'lbrunet',
        displayName: 'lbrunet',
        show_url: 'https://capco.dev/profile/lbrunet',
        vip: false,
        media: {
          url:
            'https://capco.dev/media/default/0001/01/32618f20c0942f89316be7f88d1bfa3489e2dcef.jpeg',
        },
      },
      related: {
        id: 'version2',
        kind: 'vote',
        url:
          'https://capco.dev/projects/projet-de-loi-renseignement/consultation/elaboration-de-la-loi/opinions/titre-ier-la-circulation-des-donnees-et-du-savoir/chapitre-ier-economie-de-la-donnee/section-1-ouverture-des-donnees-publiques/article-1/versions/modification-2',
        title: 'Modification 2',
      },
    },
  };

  const voteAgainstProps = cloneDeep(defaultProps);
  voteAgainstProps.vote.value = -1;

  const voteMitigatedProps = cloneDeep(defaultProps);
  voteMitigatedProps.vote.value = 0;

  const voteWithoutValueProps = cloneDeep(defaultProps);
  // $FlowFixMe
  voteWithoutValueProps.vote.value = null;

  it('renders correcty for vote for', () => {
    const wrapper = shallow(<VoteItem {...defaultProps} />);

    expect(wrapper).toMatchSnapshot();
  });

  it('renders correcty for vote against', () => {
    const wrapperAgainst = shallow(<VoteItem {...voteAgainstProps} />);

    expect(wrapperAgainst).toMatchSnapshot();
  });

  it('renders correcty for mitigated vote', () => {
    const wrapperMitigated = shallow(<VoteItem {...voteMitigatedProps} />);

    expect(wrapperMitigated).toMatchSnapshot();
  });

  it('renders correcty for vote without value', () => {
    const wrapperWithoutValue = shallow(<VoteItem {...voteWithoutValueProps} />);

    expect(wrapperWithoutValue).toMatchSnapshot();
  });
});
