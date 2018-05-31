/* eslint-env jest */
// @flow
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalFusionList } from './ProposalFusionList';

describe('<ProposalFusionList />', () => {
  // $FlowFixMe $refType
  const proposalFusionnedMergedIn = {
    id: 'proposal1',
    mergedIn: [
      {
        id: 'proposal2',
        show_url: true,
        title: 'Title Proposal 2',
      },
      {
        id: 'proposal3',
        show_url: true,
        title: 'Title Proposal 3',
      },
    ],
    mergedFrom: [],
  };
  // $FlowFixMe $refType
  const proposalFusionnedMergedFrom = {
    id: 'proposal1',
    mergedIn: [],
    mergedFrom: [
      {
        id: 'proposal2',
        show_url: true,
        title: 'Title Proposal 2',
      },
      {
        id: 'proposal3',
        show_url: true,
        title: 'Title Proposal 3',
      },
    ],
  };
  const props = {
    className: '',
    referer: 'http://capco.test',
  };

  it('should render a list of proposal merged from other proposal', () => {
    const wrapper = shallow(<ProposalFusionList proposal={proposalFusionnedMergedIn} {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a list of proposal of merged in other proposal', () => {
    const wrapper = shallow(
      <ProposalFusionList proposal={proposalFusionnedMergedFrom} {...props} />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
