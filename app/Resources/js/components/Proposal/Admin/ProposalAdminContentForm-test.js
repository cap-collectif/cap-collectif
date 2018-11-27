// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalAdminContentForm } from './ProposalAdminContentForm';
import { features } from '../../../redux/modules/default';
import { intlMock, formMock } from '../../../mocks';

describe('<ProposalAdminContentForm />', () => {
  const props = {
    ...formMock,
    features,
    handleSubmit: jest.fn(),
    intl: intlMock,
    isSuperAdmin: true,
    themes: [{ id: 'theme-1', title: 'Theme 1' }, { id: 'theme-2', title: 'Theme 2' }],
    // $FlowFixMe $refType
    proposal: {
      id: '1',
      title: 'title-1',
      summary: 'summary',
      body: 'body',
      publicationStatus: 'DRAFT',
      responses: [
        { question: { id: '1' }, value: 'value-1' },
        {
          question: { id: '2' },
          medias: [{ id: '1', name: 'media-1', size: '100', url: '' }],
        },
      ],
      mergedIn: [],
      mergedFrom: [
        { id: '1', title: 'Child 1', adminUrl: 'http://capco.dev/child1' },
        { id: '2', title: 'Child 2', adminUrl: 'http://capco.dev/child2' },
      ],
      media: { id: '1', url: '' },
      form: {
        id: 'form1',
        description: 'Description',
        districts: [],
        step: {
          id: 'step1',
        },
        categories: [{ id: '1', name: 'category-1' }, { id: '2', name: 'category-2' }],
        questions: [
          {
            id: '1',
            title: 'title',
            type: 'text',
            helpText: 'Help 1',
            description: null,
            position: 0,
            number: 1,
            jumps: [],
            private: false,
            required: true,
            validationRule: null,
            choices: [],
            isOtherAllowed: false,
          },
        ],
        usingDistrict: true,
        districtMandatory: true,
        districtHelpText: 'District Help',
        usingThemes: true,
        usingDescription: true,
        usingSummary: true,
        themeMandatory: true,
        descriptionMandatory: true,
        usingCategories: true,
        categoryMandatory: true,
        categoryHelpText: 'Category Help',
        usingAddress: true,
        titleHelpText: 'Title help',
        summaryHelpText: 'Summary Help',
        themeHelpText: 'Theme Help',
        illustrationHelpText: 'Illustration Help',
        descriptionHelpText: 'Description Help',
        addressHelpText: 'Address Help',
        proposalInAZoneRequired: true,
      },
      author: {
        id: '1',
        displayName: 'Author',
      },
      theme: { id: 'theme-1' },
      category: { id: '1' },
      address: null,
      district: { id: '1' },
    },
    responses: [],
  };

  it('render correctly', () => {
    const wrapper = shallow(<ProposalAdminContentForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
