// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProjectAdminSelectionStepForm } from './ProjectAdminSelectionStepForm';

describe('<ProjectAdminSelectionStepForm />', () => {
  const defaultProps = {
    dispatch: jest.fn(),
    isBudgetEnabled: false,
    isTresholdEnabled: false,
    isLimitEnabled: false,
    votable: false,
    votesRanking: true,
    isSecretBallotEnabled: true,
    votesLimit: 3,
    votesMin: 1,
    stepFormName: 'defaultForm',
    fcAllowedData: { FIRSTNAME: true, LASTNAME: true, DATE_OF_BIRTH: false },
  };

  it('renders correctly with no initial data', () => {
    const wrapper = shallow(<ProjectAdminSelectionStepForm {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly with data', () => {
    const props = {
      dispatch: jest.fn(),
      isBudgetEnabled: true,
      isTresholdEnabled: true,
      isLimitEnabled: true,
      votable: true,
      votesRanking: false,
      isSecretBallotEnabled: false,
      votesLimit: 0,
      votesMin: 0,
      stepFormName: 'defaultForm',
      requirements: [
        { type: 'CHECKBOX', checked: false, label: 'Sku' },
        {
          id: 'monkey_d',
          type: 'LASTNAME',
        },
      ],
      fcAllowedData: { FIRSTNAME: true, LASTNAME: true, DATE_OF_BIRTH: false },
    };
    const wrapper = shallow(<ProjectAdminSelectionStepForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
