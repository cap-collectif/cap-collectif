/* eslint-env mocha */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
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
    const wrapper = shallow(<ProposalPageMetadata proposal={proposal} showCategories={true} showDistricts={true} showNullEstimation={true} />);
    const mainDiv = wrapper.find('div.proposal__page__metadata');
    expect(mainDiv).to.have.length(1);
    const secondDiv = mainDiv.find('div.proposal__infos');
    expect(secondDiv).to.have.length(1);
    const infos = secondDiv.find('div.proposal__info');
    expect(infos).to.have.length(2);
    const category = infos.first();
    expect(category.prop('className')).to.equal('proposal__info proposal__info--category');
    const catIcon = category.find('i');
    expect(catIcon.prop('className')).to.equal('cap cap-tag-1-1');
    expect(category.children().last().text()).to.equal('Nom de la catégorie');
    const district = infos.last();
    expect(district.prop('className')).to.equal('proposal__info proposal__info--district');
    const distIcon = district.find('i');
    expect(distIcon.prop('className')).to.equal('cap cap-marker-1-1');
    expect(district.children().last().text()).to.equal('Nom du quartier');
    const estimation = secondDiv.find('ProposalDetailEstimation');
    expect(estimation.prop('proposal')).to.equal(proposal);
    expect(estimation.prop('showNullEstimation')).to.equal(true);
    const likers = secondDiv.find('ProposalDetailLikers');
    expect(likers.prop('proposal')).to.equal(proposal);
    expect(likers.prop('componentClass')).to.equal('div');
  });

  it('should not render category if specified not to', () => {
    const wrapper = shallow(<ProposalPageMetadata proposal={proposal} showCategories={false} showDistricts={true} showNullEstimation={true} />);
    const infos = wrapper.find('div.proposal__info');
    expect(infos).to.have.length(1);
    expect(wrapper.find('div.proposal__info--category')).to.have.length(0);
  });

  it('should not render category if proposal has none', () => {
    const wrapper = shallow(<ProposalPageMetadata proposal={proposalWithoutCategory} showCategories={true} showDistricts={true} showNullEstimation={true} />);
    const infos = wrapper.find('div.proposal__info');
    expect(infos).to.have.length(1);
    expect(wrapper.find('div.proposal__info--category')).to.have.length(0);
  });

  it('should not render district if specified not to', () => {
    const wrapper = shallow(<ProposalPageMetadata proposal={proposal} showCategories={true} showDistricts={false} showNullEstimation={true} />);
    const infos = wrapper.find('div.proposal__info');
    expect(infos).to.have.length(1);
    expect(wrapper.find('div.proposal__info--district')).to.have.length(0);
  });

  it('should not render district if proposal has none', () => {
    const wrapper = shallow(<ProposalPageMetadata proposal={proposalWithoutDistrict} showCategories={true} showDistricts={true} showNullEstimation={true} />);
    const infos = wrapper.find('div.proposal__info');
    expect(infos).to.have.length(1);
    expect(wrapper.find('div.proposal__info--district')).to.have.length(0);
  });
});
