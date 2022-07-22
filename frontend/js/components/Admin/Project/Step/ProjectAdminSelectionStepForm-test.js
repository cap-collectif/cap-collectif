// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProjectAdminSelectionStepForm } from './ProjectAdminSelectionStepForm';
import MockProviders from '~/testUtils';

describe('<ProjectAdminSelectionStepForm />', () => {
  const defaultProps = {
    id: 'stepId',
    dispatch: jest.fn(),
    isBudgetEnabled: false,
    isTresholdEnabled: false,
    isLimitEnabled: false,
    votable: false,
    votesRanking: true,
    isSecretBallotEnabled: true,
    isProposalSmsVoteEnabled: false,
    votesLimit: 3,
    votesMin: 1,
    stepFormName: 'defaultForm',
    fcAllowedData: { FIRSTNAME: true, LASTNAME: true, DATE_OF_BIRTH: false },
    endAt: '2050-01-01',
    isFranceConnectConfigured: true,
  };

  it('renders correctly with no initial data', () => {
    const wrapper = shallow(
      <MockProviders>
        <ProjectAdminSelectionStepForm {...defaultProps} />
      </MockProviders>,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly with data', () => {
    const props = {
      ...defaultProps,
      isBudgetEnabled: true,
      isTresholdEnabled: true,
      isLimitEnabled: true,
      votable: true,
      votesRanking: false,
      isSecretBallotEnabled: false,
      votesLimit: 0,
      votesMin: 0,
      requirements: [
        { type: 'CHECKBOX', checked: false, label: 'Sku' },
        {
          id: 'monkey_d',
          type: 'LASTNAME',
        },
      ],
      endAt: null,
      fcAllowedData: { FIRSTNAME: true, LASTNAME: true, DATE_OF_BIRTH: false },
      isFranceConnectConfigured: true,
    };
    const wrapper = shallow(
      <MockProviders>
        <ProjectAdminSelectionStepForm {...props} />
      </MockProviders>,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
