/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalForm } from './ProposalForm';

describe('<ProposalForm />', () => {
  const props = {
    intl: global.intlMock,
    currentStepId: 'step1',
    form: {
      title: 'proposal form',
      body: 'body',
      districts: [{ id: 'district1', name: 'Disctrict 1' }],
      media: null,
      themeMandatory: true,
      categoryMandatory: true,
      districtMandatory: true,
      usingDistrict: true,
      usingCategories: true,
      usingThemes: true,
      description: 'description',
      fields: [],
    },
    themes: [{ id: 1, title: 'Theme 1' }],
    categories: [{ id: 'category1', name: 'Category 1' }],
    isSubmitting: false,
    dispatch: () => {},
    features: {
      themes: true,
      districts: true,
    },
    mode: 'create',
    proposal: { title: 'Proposal title' },
  };

  it('should render a simple form without custom field', () => {
    const wrapper = shallow(<ProposalForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a simple form without custom field and district', () => {
    props.districts = [];
    const wrapper = shallow(<ProposalForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
