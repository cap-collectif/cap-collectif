/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import ProposalPageMetadata from './ProposalPageMetadata';

describe('<ProposalPageMetadata />', () => {
  const proposal = {
    title: 'Titre',
    category: {
      name: 'Nom de la catégorie',
    },
    district: {
      name: 'Nom du quartier',
    },
  };

  const proposalWithoutCategory = {
    title: 'Titre',
    district: {
      name: 'Nom du quartier',
    },
  };

  const proposalWithoutDistrict = {
    title: 'Titre',
    category: {
      name: 'Nom de la catégorie',
    },
  };

  it('should render proposal page metadata', () => {
    const wrapper = shallow(
      <ProposalPageMetadata
        proposal={proposal}
        showCategories
        showDistricts
        showNullEstimation
        showThemes
      />,
    );
    const mainDiv = wrapper.find('div.proposal__page__metadata');
    expect(mainDiv).toHaveLength(1);
    const secondDiv = mainDiv.find('div.proposal__infos');
    expect(secondDiv).toHaveLength(1);
    const infos = secondDiv.find('div.proposal__info');
    expect(infos).toHaveLength(2);
    const category = infos.first();
    expect(category.prop('className')).toEqual('proposal__info proposal__info--category ellipsis');
    const catIcon = category.find('i');
    expect(catIcon.prop('className')).toEqual('cap cap-tag-1-1 icon--blue');
    expect(
      category
        .children()
        .last()
        .text(),
    ).toEqual('Nom de la catégorie');
    const district = infos.last();
    expect(district.prop('className')).toEqual('proposal__info proposal__info--district ellipsis');
    const distIcon = district.find('i');
    expect(distIcon.prop('className')).toEqual('cap cap-marker-1-1 icon--blue');
    expect(
      district
        .children()
        .last()
        .text(),
    ).toEqual('Nom du quartier');
    const estimation = secondDiv.find('ProposalDetailEstimation');
    expect(estimation.prop('proposal')).toEqual(proposal);
    expect(estimation.prop('showNullEstimation')).toEqual(true);
    const likers = secondDiv.find('ProposalDetailLikers');
    expect(likers.prop('proposal')).toEqual(proposal);
    expect(likers.prop('componentClass')).toEqual('div');
    const avdancement = secondDiv.find('ProposalDetailEstimation');
    expect(avdancement.prop('proposal')).toEqual(proposal);
  });

  it('should not render category if specified not to', () => {
    const wrapper = shallow(
      <ProposalPageMetadata
        proposal={proposal}
        showCategories={false}
        showDistricts
        showNullEstimation
        showThemes
      />,
    );
    const infos = wrapper.find('div.proposal__info');
    expect(infos).toHaveLength(1);
    expect(wrapper.find('div.proposal__info--category')).toHaveLength(0);
  });

  it('should not render category if proposal has none', () => {
    const wrapper = shallow(
      <ProposalPageMetadata
        proposal={proposalWithoutCategory}
        showCategories
        showDistricts
        showNullEstimation
        showThemes
      />,
    );
    const infos = wrapper.find('div.proposal__info');
    expect(infos).toHaveLength(1);
    expect(wrapper.find('div.proposal__info--category')).toHaveLength(0);
  });

  it('should not render district if specified not to', () => {
    const wrapper = shallow(
      <ProposalPageMetadata
        proposal={proposal}
        showCategories
        showDistricts={false}
        showNullEstimation
        showThemes
      />,
    );
    const infos = wrapper.find('div.proposal__info');
    expect(infos).toHaveLength(1);
    expect(wrapper.find('div.proposal__info--district')).toHaveLength(0);
  });

  it('should not render district if proposal has none', () => {
    const wrapper = shallow(
      <ProposalPageMetadata
        proposal={proposalWithoutDistrict}
        showCategories
        showDistricts
        showNullEstimation
        showThemes
      />,
    );
    const infos = wrapper.find('div.proposal__info');
    expect(infos).toHaveLength(1);
    expect(wrapper.find('div.proposal__info--district')).toHaveLength(0);
  });
});
