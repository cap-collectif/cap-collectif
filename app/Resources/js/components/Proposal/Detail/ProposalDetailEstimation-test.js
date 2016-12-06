/* eslint-env jest */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import ProposalDetailEstimation from './ProposalDetailEstimation';

describe('<ProposalDetailEstimation />', () => {
  const proposal = {
    estimation: 100,
  };
  const proposalWithNullEstimation = {
    estimation: null,
  };

  it('should render a div with class proposal__info when estimation is not null', () => {
    const wrapper = shallow(<ProposalDetailEstimation proposal={proposal} showNullEstimation={false} />);
    expect(wrapper.find('div.proposal__info')).to.have.length(1);
  });

  it('should render a div with class proposal_info when estimation is null and showNullEstimation is true', () => {
    const wrapper = shallow(<ProposalDetailEstimation proposal={proposalWithNullEstimation} showNullEstimation />);
    expect(wrapper.find('div.proposal__info')).to.have.length(1);
  });

  it('should not render a div with class proposal_info when estimation is null and showNullEstimation is false', () => {
    const wrapper = shallow(<ProposalDetailEstimation proposal={proposalWithNullEstimation} showNullEstimation={false} />);
    expect(wrapper.find('div.proposal__info')).to.not.exists;
  });
});
