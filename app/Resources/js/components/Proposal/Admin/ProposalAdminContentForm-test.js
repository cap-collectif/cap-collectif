// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalAdminContentForm } from './ProposalAdminContentForm';
import { features } from '../../../redux/modules/default';

describe('<ProposalAdminContentForm />', () => {
  const props = {
    features,
    handleSubmit: jest.fn(),
    intl: global.intlMock,
    invalid: false,
    pristine: false,
    submitting: false,
    isSuperAdmin: true,
    themes: [],
    proposal: {
      id: '1',
      title: 'title-1',
      summary: 'summary',
      body: 'body',
      responses: [
        { question: { id: '1' }, value: 'value-1' },
        {
          question: { id: '2' },
          medias: [{ id: '1', name: 'media-1', size: '100', url: '' }],
        },
      ],
      media: { id: '1', url: '' },
      form: {
        districts: [],
        categories: [{ id: '1', name: 'category-1' }, { id: '2', name: 'category-2' }],
        questions: [
          {
            id: '1',
            title: 'title',
            type: 'text',
            position: 0,
            private: false,
            required: true,
          },
        ],
        usingDistrict: true,
        districtMandatory: true,
        districtHelpText: 'Help',
        usingThemes: true,
        themeMandatory: true,
        usingCategories: true,
        categoryMandatory: true,
        categoryHelpText: 'Help',
        usingAddress: true,
        titleHelpText: 'Help',
        descriptionHelpText: 'Help',
      },
      author: {
        id: '1',
        displayName: 'author-1',
      },
      theme: { id: 'theme-1' },
      category: { id: '1' },
      address: null,
      district: { id: '1' },
    },
  };

  it('render correctly', () => {
    const wrapper = shallow(<ProposalAdminContentForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
