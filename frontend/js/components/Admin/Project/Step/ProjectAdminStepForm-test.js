// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProjectAdminStepForm } from './ProjectAdminStepForm';
import { formMock, intlMock, $refType } from '~/mocks';

describe('<ProjectAdminStepForm />', () => {
  const defaultProps = {
    ...formMock,
    isCreating: false,
    intl: intlMock,
    formName: 'ProjectAdminForm',
    timeless: false,
    isAnonymousParticipationAllowed: false,
    isGridViewEnabled: false,
    isListViewEnabled: true,
    isMapViewEnabled: false,
    mainView: 'grid',
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
      type: 'OtherStep',
      timeless: false,
      isAnonymousParticipationAllowed: false,
      customCode: '<>code</>',
      isEnabled: true,
      label: 'au bois dormant',
      metaDescription: 'oeoeoe',
      mainView: 'grid',
    },
  };

  it('renders correctly', () => {
    const wrapper = shallow(<ProjectAdminStepForm {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly when form creating', () => {
    const wrapper = shallow(<ProjectAdminStepForm {...defaultProps} isCreating />);
    expect(wrapper).toMatchSnapshot();
  });
});
