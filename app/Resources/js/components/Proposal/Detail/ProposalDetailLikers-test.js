/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { OverlayTrigger } from 'react-bootstrap';
import ProposalDetailLikers from './ProposalDetailLikers';
import ProposalDetailLikersTooltipLabel from './ProposalDetailLikersTooltipLabel';
import ProposalDetailLikersLabel from './ProposalDetailLikersLabel';

describe('<ProposalDetailLikers />', () => {
  const proposalWithoutLikers = {
    likers: [],
  };

  it('should not render anything when proposal has no likers', () => {
    const wrapper = shallow(<ProposalDetailLikers proposal={proposalWithoutLikers} />);
    expect(wrapper.children()).toHaveLength(0);
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
    expect(wrapper.find('span.proposal__info')).toHaveLength(1);
  });

  it('should render a <OverlayTrigger /> with <Tooltip /> when proposal has likers', () => {
    const wrapper = shallow(<ProposalDetailLikers proposal={proposalWithLikers} />);
    const overlayTrigger = wrapper.find(OverlayTrigger);
    expect(overlayTrigger).toHaveLength(1);
    expect(overlayTrigger.prop('placement')).toEqual('top');
    const tooltip = shallow(overlayTrigger.prop('overlay'));
    expect(tooltip.instance()).toBeDefined();
    expect(tooltip.prop('id')).toEqual('proposal-1-likers-tooltip-');
    const tooltipLabel = tooltip.find(ProposalDetailLikersTooltipLabel);
    expect(tooltipLabel).toHaveLength(1);
    expect(tooltipLabel.prop('likers')).toEqual(proposalWithLikers.likers);
  });

  it('should render a <ProposalDetailLikersLabel> when proposal has likers', () => {
    const wrapper = shallow(<ProposalDetailLikers proposal={proposalWithLikers} />);
    const label = wrapper.find(ProposalDetailLikersLabel);
    expect(label).toHaveLength(1);
    expect(label.prop('likers')).toEqual(proposalWithLikers.likers);
  });

  it('should render a div with class proposal__info when specified', () => {
    const wrapper = shallow(
      <ProposalDetailLikers componentClass="div" proposal={proposalWithLikers} />,
    );
    expect(wrapper.find('div.proposal__info')).toHaveLength(1);
  });
});
