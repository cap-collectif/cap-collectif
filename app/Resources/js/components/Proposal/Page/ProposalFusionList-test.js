/* eslint-env jest */
// @flow
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalFusionList } from './ProposalFusionList';
import { $refType } from '../../../mocks';

describe('<ProposalFusionList />', () => {
  const proposalFusionnedMergedIn = {
    $refType,
    id: 'proposal1',
    mergedIn: [
      {
        id: 'proposal2',
        url: true,
        title: 'Title Proposal 2',
      },
      {
        id: 'proposal3',
        url: true,
        title: 'Title Proposal 3',
      },
    ],
    mergedFrom: [],
  };
  const proposalFusionnedMergedFrom = {
    $refType,
    id: 'proposal1',
    mergedIn: [],
    mergedFrom: [
      {
        id: 'proposal2',
        url: true,
        title: 'Title Proposal 2',
      },
      {
        id: 'proposal3',
        url: true,
        title: 'Title Proposal 3',
      },
    ],
  };

  it('should render a list of proposal merged from other proposal', () => {
    const wrapper = shallow(<ProposalFusionList proposal={proposalFusionnedMergedIn} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a list of proposal of merged in other proposal', () => {
    const wrapper = shallow(<ProposalFusionList proposal={proposalFusionnedMergedFrom} />);
    expect(wrapper).toMatchSnapshot();
  });
});
