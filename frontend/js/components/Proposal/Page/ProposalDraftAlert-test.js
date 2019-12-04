// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalDraftAlert } from './ProposalDraftAlert';
import { $refType } from '../../../mocks';

describe('<ProposalDraftAlert />', () => {
  const proposal = {
    publicationStatus: 'DRAFT',
    $refType,
  };

  const proposalNotInDraft = {
    publicationStatus: 'PUBLISHED',
    $refType,
  };

  it('should render draft alert', () => {
    const wrapper = shallow(<ProposalDraftAlert proposal={proposal} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should not render draft alert', () => {
    const wrapper = shallow(<ProposalDraftAlert proposal={proposalNotInDraft} />);
    expect(wrapper).toMatchSnapshot();
  });
});
