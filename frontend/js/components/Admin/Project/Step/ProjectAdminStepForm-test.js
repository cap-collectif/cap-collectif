// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProjectAdminStepForm } from './ProjectAdminStepForm';
import { formMock, intlMock } from '~/mocks';

describe('<ProjectAdminStepForm />', () => {
  const defaultProps = {
    ...formMock,
    intl: intlMock,
    formName: 'ProjectAdminForm',
    timeless: false,
    step: {
      id: '1',
      url: '/sku',
      body: 'TestBody',
      startAt: 'date',
      endAt: null,
      title: 'testTitle',
      type: 'OtherStep',
      timeless: false,
      customCode: '<>code</>',
      isEnabled: true,
      label: 'au bois dormant',
      metaDescription: 'oeoeoe',
    },
  };

  it('renders correctly', () => {
    const wrapper = shallow(<ProjectAdminStepForm {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });
});
