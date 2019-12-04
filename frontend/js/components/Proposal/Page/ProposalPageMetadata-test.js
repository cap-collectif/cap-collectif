/* eslint-env jest */
// @flow
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalPageMetadata } from './ProposalPageMetadata';
import { $refType, $fragmentRefs } from '../../../mocks';

const proposal = {
  $refType,
  $fragmentRefs,
  id: '1',
  theme: null,
  estimation: null,
  likers: [],
  category: {
    name: 'Nom de la catégorie',
  },
  district: {
    name: 'Nom du quartier',
  },
  reference: 'Reference',
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
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
