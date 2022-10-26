/* eslint-env jest */
// @flow
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalPageFusionInformations } from './ProposalPageFusionInformations';
import { $refType } from '~/mocks';

describe('<ProposalPageFusionInformations />', () => {
  const proposalFusionnedMergedIn = {
    $refType,
    id: 'proposal1',
    mergedIn: [
      {
        id: 'proposal2',
        url: 'https://capco.dev/proposals/2',
        title: 'Title Proposal 2',
      },
      {
        id: 'proposal3',
        url: 'https://capco.dev/proposals/3',
        title: 'Title Proposal 3',
      },
    ],
    hasBeenMerged: true,
    mergedFrom: [],
    form: {
      objectType: 'PROPOSAL',
    },
  };
  const proposalFusionnedMergedFrom = {
    $refType,
    id: 'proposal1',
    mergedIn: [],
    hasBeenMerged: true,
    mergedFrom: [
      {
        id: 'proposal2',
        url: 'https://capco.dev/proposals/2',
        title: 'Title Proposal 2',
      },
      {
        id: 'proposal3',
        url: 'https://capco.dev/proposals/3',
        title: 'Title Proposal 3',
      },
    ],
    form: {
      objectType: 'PROPOSAL',
    },
  };

  it('should render a list of proposal merged from other proposal', () => {
    const wrapper = shallow(
      <ProposalPageFusionInformations proposal={proposalFusionnedMergedIn} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a list of proposal of merged in other proposal', () => {
    const wrapper = shallow(
      <ProposalPageFusionInformations proposal={proposalFusionnedMergedFrom} />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
