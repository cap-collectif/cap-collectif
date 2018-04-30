// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import ProposalDraftAlert from './ProposalDraftAlert';

describe('<ProposalDraftAlert />', () => {
  const proposal = {
    isDraft: true,
  };

  const proposalNotInDraft = {
    isDraft: false,
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
