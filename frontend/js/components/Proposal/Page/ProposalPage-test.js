/* eslint-env jest */
// @flow
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalPage } from './ProposalPage';

describe('<ProposalPage />', () => {
  const proposalId = '41';

  it('should render a proposal page', () => {
    const wrapper = shallow(
      <ProposalPage isAuthenticated currentVotableStepId={null} proposalId={proposalId} />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
