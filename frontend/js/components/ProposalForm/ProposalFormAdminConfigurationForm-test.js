// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { features } from '../../redux/modules/default';
import { ProposalFormAdminConfigurationForm } from './ProposalFormAdminConfigurationForm';
import {
  intlMock,
  formMock,
  $refType,
  relayRefetchMock,
  $fragmentRefs,
  googleAddressMock,
} from '~/mocks';

describe('<ProposalFormAdminConfigurationForm />', () => {
  const props = {
    ...formMock,
    intl: intlMock,
    query: {
      $fragmentRefs,
      $refType,
      viewer: { isSuperAdmin: false },
    },
    proposalForm: {
      $fragmentRefs,
      $refType,
      canContact: false,
      allowAknowledge: true,
      descriptionMandatory: true,
      isProposalForm: true,
      id: 'proposalFormId',
      description: 'description',
      usingThemes: true,
      themeMandatory: true,
      usingCategories: true,
      categoryMandatory: true,
      usingAddress: true,
      usingDescription: true,
      usingIllustration: false,
      usingSummary: false,
      mapCenter: {
        lat: 0,
        lng: 0,
        json: googleAddressMock.json,
      },
      zoomMap: 0,
      illustrationHelpText: '',
      addressHelpText: '',
      themeHelpText: '',
      categoryHelpText: '',
      descriptionHelpText: '',
      proposalInAZoneRequired: true,
      summaryHelpText: '',
      titleHelpText: '',
      usingDistrict: true,
      districtHelpText: '',
      districtMandatory: true,
      isMapViewEnabled: false,
      isListViewEnabled: false,
      isGridViewEnabled: false,
      categories: [
        {
          id: 'category1',
          name: 'Category 1 ',
          categoryImage: null,
        },
      ],
      districts: [],
      questions: [
        {
          id: 'field-1',
          title: 'Titre 1',
          required: false,
          hidden: false,
          level: 0,
          helpText: null,
          description: 'des cryptes Sion',
          type: 'text',
          __typename: 'SimpleQuestion',
          private: false,
          number: 1,
          position: 1,
          alwaysJumpDestinationQuestion: null,
          jumps: [],
        },
      ],
    },
    defaultLanguage: 'fr-FR',
    usingAddress: true,
    usingCategories: true,
    usingThemes: true,
    usingDistrict: true,
    usingDescription: true,
    usingIllustration: false,
    usingSummary: false,
    isMapViewEnabled: false,
    features,
    relay: relayRefetchMock,
  };

  it('render correctly', () => {
    const wrapper = shallow(<ProposalFormAdminConfigurationForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
