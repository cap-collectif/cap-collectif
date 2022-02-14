// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProjectAdminStepForm } from './ProjectAdminStepForm';
import { formMock, intlMock, $refType } from '~/mocks';
import { features } from '~/redux/modules/default';
import MockProviders from '~/testUtils';

describe('<ProjectAdminStepForm />', () => {
  const defaultProps = {
    ...formMock,
    features,
    isCreating: false,
    intl: intlMock,
    formName: 'ProjectAdminForm',
    timeless: false,
    isAnonymousParticipationAllowed: false,
    isGridViewEnabled: false,
    isListViewEnabled: true,
    isMapViewEnabled: false,
    mainView: 'GRID',
    project: {
      $refType,
      firstCollectStep: {
        form: {
          isGridViewEnabled: false,
          isListViewEnabled: true,
          isMapViewEnabled: true,
        },
      },
    },
    step: {
      id: '1',
      url: '/sku',
      body: 'TestBody',
      startAt: 'date',
      endAt: null,
      title: 'testTitle',
      __typename: 'OtherStep',
      timeless: false,
      isAnonymousParticipationAllowed: false,
      customCode: '<>code</>',
      isEnabled: true,
      label: 'au bois dormant',
      metaDescription: 'oeoeoe',
      mainView: 'GRID',
      isSecretBallot: false,
    },
    fcAllowedData: { FIRSTNAME: true, LASTNAME: true, DATE_OF_BIRTH: false },
    isFranceConnectConfigured: true,
    hasIdentificationCodeLists: true,
  };

  it('renders correctly', () => {
    const wrapper = shallow(
      <MockProviders store={{ user: { user: { isAdmin: true } } }}>
        <ProjectAdminStepForm {...defaultProps} />
      </MockProviders>,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly when form creating', () => {
    const wrapper = shallow(
      <MockProviders store={{ user: { user: { isAdmin: true } } }}>
        <ProjectAdminStepForm {...defaultProps} isCreating />
      </MockProviders>,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
