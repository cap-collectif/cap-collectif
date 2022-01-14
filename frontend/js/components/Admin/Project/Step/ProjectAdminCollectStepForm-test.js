// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProjectAdminCollectStepForm } from './ProjectAdminCollectStepForm';
import MockProviders from '~/testUtils';

describe('<ProjectAdminCollectStepForm />', () => {
  const defaultProps = {
    dispatch: jest.fn(),
    isBudgetEnabled: true,
    isLimitEnabled: false,
    isTresholdEnabled: true,
    isSecretBallotEnabled: true,
    votable: true,
    isPrivate: false,
    votesRanking: true,
    votesLimit: 3,
    votesMin: 1,
    stepFormName: 'defaultForm',
    fcAllowedData: { FIRSTNAME: true, LASTNAME: true, DATE_OF_BIRTH: false },
  };

  it('renders correctly for project admin', () => {
    const wrapper = shallow(
      <MockProviders store={{ user: { user: { isAdmin: false } } }}>
        <ProjectAdminCollectStepForm {...defaultProps} />
      </MockProviders>,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly for admin', () => {
    const wrapper = shallow(
      <MockProviders store={{ user: { user: { isAdmin: true } } }}>
        <ProjectAdminCollectStepForm {...defaultProps} />
      </MockProviders>,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
