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
    step: {
      id: '1',
      body: 'TestBody',
      timeRange: {
        startAt: 'date',
        endAt: null,
      },
      title: 'testTitle',
      type: 'non',
    },
  };

  it('renders correctly empty', () => {
    const wrapper = shallow(<ProjectAdminStepForm {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });
});
