// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalDetailLikersTooltipLabel } from './ProposalDetailLikersTooltipLabel';
import { $refType } from '../../../mocks';

describe('<ProposalDetailLikersTooltipLabel />', () => {
  const oneLiker = [
    {
      id: '1',
      displayName: 'user',
    },
  ];

  const severalLikers = [
    {
      id: '1',
      displayName: 'user 1',
    },
    {
      id: '2',
      displayName: 'user 2',
    },
  ];

  it('should render a formatted message when one liker', () => {
    const wrapper = shallow(
      <ProposalDetailLikersTooltipLabel proposal={{ $refType, id: '1', likers: oneLiker }} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render two formatted message when several likers', () => {
    const wrapper = shallow(
      <ProposalDetailLikersTooltipLabel proposal={{ $refType, id: '1', likers: severalLikers }} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render nothing when no likers', () => {
    const wrapper = shallow(
      <ProposalDetailLikersTooltipLabel proposal={{ $refType, id: '1', likers: [] }} />,
    );
    expect(wrapper.children()).toHaveLength(0);
    expect(wrapper).toMatchSnapshot();
  });
});
