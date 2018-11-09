// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalForm } from './ProposalForm';
import { intlMock, formMock } from '../../../mocks';
import { features } from '../../../redux/modules/default';

describe('<ProposalForm />', () => {
  const proposalForm = {
      id: 'proposalForm1',
      description: 'Description 1',
      step: {
        id: 'step1',
      },
      districts: [
        {
          id: 'district1',
          name: 'District 1',
        },
        {
          id: 'district2',
          name: 'District 2',
        },
      ],
      categories: [
        {
          id: 'category1',
          name: 'Category 1',
        },
        {
          id: 'category2',
          name: 'Category 2',
        },
      ],
      questions: [
        {
          id: 'question1',
          title: 'Lol',
          helpText: 'Question 1',
          description: null,
          type: 'text',
          position: 1,
          jumps: [],
          private: true,
          required: true,
          validationRule: null,
          choices: [],
          isOtherAllowed: false,
        },
      ],
      isProposalForm: true,
      usingDistrict: true,
      usingDescription: true,
      usingSummary: true,
      usingIllustration: true,
      districtMandatory: true,
      districtHelpText: 'District help',
      usingThemes: true,
      themeMandatory: true,
      descriptionMandatory: true,
      summaryMandatory: true,
      illustrationMandatory: true,
      usingCategories: true,
      categoryMandatory: true,
      categoryHelpText: 'Category help',
      usingAddress: true,
      titleHelpText: 'Title help',
      summaryHelpText: 'Summary help',
      themeHelpText: 'Theme help',
      illustrationHelpText: 'Illustration help',
      descriptionHelpText: 'Description help',
      addressHelpText: 'Address help',
      proposalInAZoneRequired: true,
  };

  const props = {
    intl: intlMock,
    ...formMock,
    responses: [],
    // $FlowFixMe $refType
    proposalForm: {
      ...proposalForm
    },
    themes: [{ id: 'theme1', title: 'Theme 1' }],
    submitting: false,
    dispatch: jest.fn(),
    features: {
      ...features,
      themes: true,
      districts: true,
    },
    titleValue: 'Proposal title',
    addressValue: null,
    // $FlowFixMe $refType
    proposal: {
      id: 'proposal1',
      title: 'Proposal title',
      body: 'Proposal Body',
      summary: 'Proposal summary',
      publicationStatus: 'PUBLISHED',
      address: null,
      theme: { id: 'theme1' },
      district: { id: 'district1' },
      category: { id: 'category1' },
      responses: [
        {
          question: {
            id: 'question1',
          },
          value: 'lol',
        },
      ],
      media: {
        id: 'media1',
        url: 'http://capco.dev',
        size: '50',
        name: 'paul.jpg',
      },
    },
  };

  it('should render an edit form', () => {
    const wrapper = shallow(<ProposalForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a create Proposal form', () => {
    const wrapper = shallow(<ProposalForm {...props} proposal={null} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a create Question form', () => {
    const questionProps = {
      ...props,
      // $FlowFixMe $refType
      proposalForm: {
        ...proposalForm,
        isProposalForm: false
      }
    };
    const wrapper = shallow(<ProposalForm {...questionProps} proposal={null} />);
    expect(wrapper).toMatchSnapshot();
  });
});
