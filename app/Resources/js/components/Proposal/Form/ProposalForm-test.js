/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalForm } from './ProposalForm';

describe('<ProposalForm />', () => {
  const props = {
    intl: global.intlMock,
    currentStepId: '1',
    form: {
      title: 'proposal form',
      body: 'body',
      theme: -1,
      district: null,
      category: -1,
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
    themes: [{ id: 1, title: 'theme1' }],
    districts: [{ id: 1, name: 'disctrict1' }],
    categories: [{ id: 1, name: 'category1' }],
    isSubmitting: false,
    dispatch: () => {},
    features: {
      themes: true,
      districts: true,
    },
    mode: 'create',
    proposal: { title: 'proposal title' },
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
