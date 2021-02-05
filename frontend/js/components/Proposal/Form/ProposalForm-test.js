// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalForm } from './ProposalForm';
import { $refType, intlMock, formMock } from '~/mocks';
import { features } from '~/redux/modules/default';

describe('<ProposalForm />', () => {
  const hiddenQuestionsProposalForm = {
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
        level: 0,
        type: 'text',
        position: 1,
        number: 1,
        jumps: [],
        hidden: true,
        alwaysJumpDestinationQuestion: null,
        private: true,
        required: true,
        validationRule: null,
        __typename: 'SimpleQuestion',
        choices: {
          pageInfo: {
            hasNextPage: false,
          },
          totalCount: 0,
          edges: [],
        },
        isRangeBetween: false,
        rangeMin: null,
        rangeMax: null,
        isOtherAllowed: false,
      },
    ],
    suggestingSimilarProposals: true,
    objectType: 'PROPOSAL',
    usingDistrict: true,
    usingDescription: true,
    usingSummary: true,
    usingIllustration: true,
    districtMandatory: true,
    districtHelpText: 'District help',
    usingThemes: true,
    themeMandatory: true,
    descriptionMandatory: true,
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
    usingTipsmeee: false,
    tipsmeeeHelpText: null,
  };
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
        level: null,
        number: 1,
        jumps: [],
        hidden: false,
        alwaysJumpDestinationQuestion: null,
        private: true,
        required: true,
        validationRule: null,
        __typename: 'SimpleQuestion',
        choices: {
          pageInfo: {
            hasNextPage: false,
          },
          totalCount: 0,
          edges: [],
        },
        isRangeBetween: true,
        rangeMin: 0,
        rangeMax: 10,
        isOtherAllowed: false,
      },
    ],
    suggestingSimilarProposals: true,
    objectType: 'PROPOSAL',
    usingDistrict: true,
    usingDescription: true,
    usingSummary: true,
    usingIllustration: true,
    districtMandatory: true,
    districtHelpText: 'District help',
    usingThemes: true,
    themeMandatory: true,
    descriptionMandatory: true,
    usingCategories: true,
    usingTipsmeee: true,
    tipsmeeeHelpText: 'this is tipsmeee',
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
    tipsmeeeIdDisabled: false,
    responses: [],
    proposalForm: {
      ...proposalForm,
      $refType,
    },
    user: { id: 'user', username: 'user' },
    themes: [{ id: 'theme1', title: 'Theme 1' }],
    submitting: false,
    dispatch: jest.fn(),
    features: {
      ...features,
      themes: true,
      districts: true,
      unstable__tipsmeee: false,
    },
    titleValue: 'Proposal title',
    addressValue: null,
    proposal: {
      id: 'proposal1',
      title: 'Proposal title',
      body: 'Proposal Body',
      summary: 'Proposal summary',
      publicationStatus: 'PUBLISHED',
      address: null,
      tipsmeeeId: '8w0k53L28',
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
      $refType,
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
      tipsmeeeIdDisabled: false,
      proposalForm: {
        ...proposalForm,
        $refType,
        objectType: 'QUESTION',
      },
    };
    const wrapper = shallow(<ProposalForm {...questionProps} proposal={null} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a create Question form with hidden questions', () => {
    const questionProps = {
      ...props,
      tipsmeeeIdDisabled: false,
      proposalForm: {
        ...hiddenQuestionsProposalForm,
        $refType,
        objectType: 'QUESTION',
      },
    };
    const wrapper = shallow(<ProposalForm {...questionProps} proposal={null} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('should render a create ESTABLISHMENT form ', () => {
    const establishmentProps = {
      ...props,
      features: {
        ...features,
        themes: true,
        districts: true,
        unstable__tipsmeee: true,
      },
      tipsmeeeIdDisabled: true,
      proposalForm: {
        ...proposalForm,
        usingTipsmeee: true,
        $refType,
        objectType: 'ESTABLISHMENT',
      },
    };
    const wrapper = shallow(<ProposalForm {...establishmentProps} proposal={null} />);
    expect(wrapper).toMatchSnapshot();
  });
});
