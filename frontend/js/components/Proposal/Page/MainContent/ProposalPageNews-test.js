/* eslint-env jest */
// @flow
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalPageNews } from './ProposalPageNews';
import { $refType, $fragmentRefs } from '~/mocks';

describe('<ProposalPageNews />', () => {
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
            $fragmentRefs,
            id: 'news1',
            title: 'Réponse Officielle',
          },
        },
        {
          node: {
            $fragmentRefs,
            id: 'news2',
            title: 'Réponse Pas Officielle',
          },
        },
      ],
    },
  };

  it('should render correctly', () => {
    const wrapper = shallow(<ProposalPageNews proposal={proposal} goToBlog={jest.fn()} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('should render correctly without news', () => {
    const wrapper = shallow(<ProposalPageNews proposal={emptyProposal} goToBlog={jest.fn()} />);
    expect(wrapper).toMatchSnapshot();
  });
});
