/* eslint-env jest */
// @flow
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalPageMetadata } from './ProposalPageMetadata';

const proposal = {
  title: 'Titre',
  category: {
    name: 'Nom de la catégorie'
  },
  district: {
    name: 'Nom du quartier'
  },
  reference: 'Reference'
};

const proposalWithoutCategory = {
  title: 'Titre',
  district: {
    name: 'Nom du quartier'
  },
  reference: 'Reference'
};

const proposalWithoutDistrict = {
  title: 'Titre',
  category: {
    name: 'Nom de la catégorie'
  },
  reference: 'Reference'
};

describe('<ProposalPageMetadata />', () => {
  it('should render proposal page metadata', () => {
    const wrapper = shallow(
      <ProposalPageMetadata
        proposal={proposal}
        showCategories
        showDistricts
        showNullEstimation
        showThemes
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should not render category if specified not to', () => {
    const wrapper = shallow(
      <ProposalPageMetadata
        proposal={proposal}
        showCategories={false}
        showDistricts
        showNullEstimation
        showThemes
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should not render category if proposal has none', () => {
    const wrapper = shallow(
      <ProposalPageMetadata
        proposal={proposalWithoutCategory}
        showCategories
        showDistricts
        showNullEstimation
        showThemes
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should not render district if specified not to', () => {
    const wrapper = shallow(
      <ProposalPageMetadata
        proposal={proposal}
        showCategories
        showDistricts={false}
        showNullEstimation
        showThemes
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should not render district if proposal has none', () => {
    const wrapper = shallow(
      <ProposalPageMetadata
        proposal={proposalWithoutDistrict}
        showCategories
        showDistricts
        showNullEstimation
        showThemes
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
