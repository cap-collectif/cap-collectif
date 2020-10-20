/* eslint-env jest */
// @flow
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalPageOfficialAnswer } from './ProposalPageOfficialAnswer';
import { $refType } from '~/mocks';

describe('<ProposalPageOfficialAnswer />', () => {
  const emptyProposal = {
    $refType,
    id: 'proposal1',
    news: { edges: [] },
  };

  const proposal = {
    ...emptyProposal,
    news: {
      edges: [
        {
          node: {
            id: 'news1',
            title: 'Réponse officielle',
            body: 'GG mec c accepté',
            publishedAt: '2020_06_07',
            authors: [{ id: 'author1', username: 'moi', media: null }],
          },
        },
      ],
    },
  };

  it('should render correctly', () => {
    const wrapper = shallow(<ProposalPageOfficialAnswer proposal={proposal} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('should render correctly without an official answer', () => {
    const wrapper = shallow(<ProposalPageOfficialAnswer proposal={emptyProposal} />);
    expect(wrapper).toMatchSnapshot();
  });
});
