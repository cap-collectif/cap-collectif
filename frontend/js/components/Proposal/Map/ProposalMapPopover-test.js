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
    slug: 'test-proposal',
    title: 'testProposal',
    currentVotableStep: { id: 'id' },
    author: { $fragmentRefs },
    media: { url: 'media.jpg' },
    category: null,
    status: null,
    form: { step: { url: '/step' } },
  };

  const proposalWithoutMedia = {
    $refType,
    url: 'http://test.com',
    title: 'testProposal',
    slug: 'test-proposal',
    author: { $fragmentRefs },
    media: null,
    currentVotableStep: { id: 'id' },
    status: { name: 'cv ou quoi le frer le boss lacoste tn ou pas?', color: 'SUCCESS' },
    category: { name: 'Cat', categoryImage: null, icon: 'wheelchair', color: 'purple' },
    form: { step: { url: '/step' } },
  };

  it('should render popover with a picture given the feature is enabled', () => {
    const props = {
      features: { ...features, display_pictures_in_depository_proposals_list: true },
      proposal,
    };
    const wrapper = shallow(<ProposalMapPopover {...props} />);
    const cover = wrapper.find('img');
    expect(wrapper).toMatchSnapshot();
    expect(cover).toHaveLength(1);
  });

  it('should render popover without a picture given the feature is disabled', () => {
    const props = {
      features: { ...features, display_pictures_in_depository_proposals_list: false },
      proposal,
    };
    const wrapper = shallow(<ProposalMapPopover {...props} />);
    const cover = wrapper.find('img');
    expect(wrapper).toMatchSnapshot();
    expect(cover).toHaveLength(0);
  });

  it('should render popover with a default picture given a proposal without a media', () => {
    const props = {
      features: { ...features, display_pictures_in_depository_proposals_list: true },
      proposal: proposalWithoutMedia,
    };
    const wrapper = shallow(<ProposalMapPopover {...props} />);
    const cover = wrapper.find('SimpleProposalBackground');
    expect(wrapper).toMatchSnapshot();
    expect(cover).toHaveLength(1);
  });
});
