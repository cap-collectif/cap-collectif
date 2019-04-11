// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalPreviewStatus } from './ProposalPreviewStatus';
import { $refType } from '../../../mocks';

describe('<ProposalPreviewStatus />', () => {
  const proposal = {
    $refType,
    trashed: false,
    trashedStatus: null,
    trashedReason: null,
    status: {
      name: 'Projet retenu',
      color: 'success',
    },
  };

  it('render a trashed status for a trashed visible proposal', () => {
    const trashedVisibleProposal = {
      ...proposal,
      trashed: true,
      trashedStatus: 'VISIBLE',
      trashedReason: 'spam',
    };
    const wrapper = shallow(<ProposalPreviewStatus proposal={trashedVisibleProposal} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('render a trashed status for a trashed invisible proposal', () => {
    const trashedInvisibleProposal = {
      ...proposal,
      trashed: true,
      trashedStatus: 'INVISIBLE',
      trashedReason: 'propos illégaux',
    };
    const wrapper = shallow(<ProposalPreviewStatus proposal={trashedInvisibleProposal} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('render a status when proposal has a status', () => {
    const wrapper = shallow(<ProposalPreviewStatus proposal={proposal} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('render null when no status', () => {
    const proposalWithoutStatus = {
      ...proposal,
      status: null,
    };
    const wrapper = shallow(<ProposalPreviewStatus proposal={proposalWithoutStatus} />);
    expect(wrapper).toMatchSnapshot();
  });
});
