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
      slug: 'step-1',
      project: null,
    },
    districts: [
      {
        id: 'district1',
        name: 'District 1',
        displayedOnMap: false,
        geojson: '',
      },
      {
        id: 'district2',
        name: 'District 2',
        displayedOnMap: false,
        geojson: '',
      },
    ],
    categories: [
      {
        id: 'category1',
        name: 'Category 1',
        color: 'blue',
        icon: null,
      },
      {
        id: 'category2',
        name: 'Category 2',
        color: 'red',
        icon: 'tractor',
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
        destinationJumps: [],
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
    usingFacebook: true,
    usingWebPage: true,
    usingTwitter: true,
    usingInstagram: true,
    usingYoutube: true,
    usingLinkedIn: true,
    isUsingAnySocialNetworks: true,
  };
  const proposalForm = {
    id: 'proposalForm1',
    description: 'Description 1',
    step: {
      id: 'step1',
      slug: 'slug',
      project: null,
    },
    districts: [
      {
        id: 'district1',
        name: 'District 1',
        displayedOnMap: false,
        geojson: '',
      },
      {
        id: 'district2',
        name: 'District 2',
        displayedOnMap: false,
        geojson: '',
      },
    ],
    categories: [
      {
        id: 'category1',
        name: 'Category 1',
        color: 'blue',
        icon: null,
      },
      {
        id: 'category2',
        name: 'Category 2',
        color: 'red',
        icon: 'tractor',
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
        destinationJumps: [],
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
    usingFacebook: true,
    usingWebPage: true,
    usingTwitter: true,
    usingInstagram: true,
    usingYoutube: true,
    usingLinkedIn: true,
    isUsingAnySocialNetworks: true,
  };

  const props = {
    intl: intlMock,
    ...formMock,
    responses: [],
    proposalForm: {
      ...proposalForm,
      $refType,
    },
    user: { id: 'user', username: 'user' },
    themes: [{ id: 'theme1', title: 'Theme 1' }],
    submitting: false,
    dispatch: jest.fn(),
    onSubmitSuccess: jest.fn(),
    onSubmitFailed: jest.fn(),
    category: null,
    features: {
      ...features,
      themes: true,
      districts: true,
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
      twitterUrl: 'http://twitter.com',
      facebookUrl: 'http://facebook.com',
      youtubeUrl: 'http://youtube.com',
      webPageUrl: 'http://cap-collectif.com',
      instagramUrl: 'http://instagram.com',
      linkedInUrl: 'http://linkedin.com',
      bodyUsingJoditWysiwyg: false,
      $refType,
    },
    geoJsons: [],
    isBackOfficeInput: false,
  };

  it('should render an edit form', () => {
    const wrapper = shallow(<ProposalForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a create Proposal form', () => {
    const wrapper = shallow(<ProposalForm {...props} proposal={null} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('should render a create Proposal form from back office', () => {
    const wrapper = shallow(<ProposalForm {...props} proposal={null} isBackOfficeInput />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a create Question form', () => {
    const questionProps = {
      ...props,
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
      },
      proposalForm: {
        ...proposalForm,
        $refType,
        objectType: 'ESTABLISHMENT',
      },
      isBackOfficeInput: false,
    };
    const wrapper = shallow(<ProposalForm {...establishmentProps} proposal={null} />);
    expect(wrapper).toMatchSnapshot();
  });
});
