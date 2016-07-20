/* eslint-env mocha */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import ProposalDetailLikers from './ProposalDetailLikers';
import ProposalDetailLikersTooltipLabel from './ProposalDetailLikersTooltipLabel';
import ProposalDetailLikersLabel from './ProposalDetailLikersLabel';

describe('<ProposalDetailLikers />', () => {
  const proposalWithoutLikers = {
    likers: [],
  };

  it('should not render anything when proposal has no likers', () => {
    const wrapper = shallow(<ProposalDetailLikers proposal={proposalWithoutLikers} />);
    expect(wrapper.children()).to.have.length(0);
  });

  const proposalWithLikers = {
    id: 1,
    likers: [
      {
        displayName: 'user',
      },
    ],
  };

  it('should render a span with class proposal__info when proposal has likers', () => {
    const wrapper = shallow(<ProposalDetailLikers proposal={proposalWithLikers} />);
    expect(wrapper.find('span.proposal__info')).to.have.length(1);
  });

  it('should render a <OverlayTrigger /> with <Tooltip /> when proposal has likers', () => {
    const wrapper = shallow(<ProposalDetailLikers proposal={proposalWithLikers} />);
    const overlayTrigger = wrapper.find(OverlayTrigger);
    expect(overlayTrigger).to.have.length(1);
    expect(overlayTrigger.prop('placement')).to.equal('top');
    const tooltip = shallow(overlayTrigger.prop('overlay'));
    expect(tooltip.instance()).to.be.instanceOf(Tooltip);
    expect(tooltip.prop('id')).to.equal('proposal-1-likers-tooltip-');
    const tooltipLabel = tooltip.find(ProposalDetailLikersTooltipLabel);
    expect(tooltipLabel).to.have.length(1);
    expect(tooltipLabel.prop('likers')).to.equal(proposalWithLikers.likers);
  });

  it('should render a <ProposalDetailLikersLabel> when proposal has likers', () => {
    const wrapper = shallow(<ProposalDetailLikers proposal={proposalWithLikers} />);
    const label = wrapper.find(ProposalDetailLikersLabel);
    expect(label).to.have.length(1);
    expect(label.prop('likers')).to.equal(proposalWithLikers.likers);
  });
});
