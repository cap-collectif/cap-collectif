// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalMapPopover } from './ProposalMapPopover';
import { $fragmentRefs, $refType } from '../../../mocks';
import { features } from '../../../redux/modules/default';

describe('<ProposalMapPopover />', () => {
  const proposal = {
    $refType,
    url: 'http://test.com',
    title: 'testProposal',
    publishedAt: '2017-02-01 00:04:00',
    author: { $fragmentRefs },
    media: { url: 'media.jpg' },
  };

  const proposalWithoutMedia = {
    $refType,
    url: 'http://test.com',
    title: 'testProposal',
    publishedAt: '2017-02-01 00:04:00',
    author: { $fragmentRefs },
    media: null,
  };

  it('should render popover with a picture given the feature is enabled', () => {
    const props = {
      features: { ...features, display_pictures_in_depository_proposals_list: true },
      proposal,
    };
    const wrapper = shallow(<ProposalMapPopover {...props} />);
    const cover = wrapper.find('ProposalMapPopover__PopoverCover');
    expect(cover).toHaveLength(1);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render popover without a picture given the feature is disabled', () => {
    const props = {
      features: { ...features, display_pictures_in_depository_proposals_list: false },
      proposal,
    };
    const wrapper = shallow(<ProposalMapPopover {...props} />);
    const cover = wrapper.find('ProposalMapPopover__PopoverCover');
    expect(cover).toHaveLength(0);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render popover with a default picture given a proposal without a media', () => {
    const props = {
      features: { ...features, display_pictures_in_depository_proposals_list: true },
      proposal: proposalWithoutMedia,
    };
    const wrapper = shallow(<ProposalMapPopover {...props} />);
    const cover = wrapper.find('ProposalMapPopover__PopoverCover');
    expect(cover).toHaveLength(1);
    expect(wrapper).toMatchSnapshot();
  });
});
