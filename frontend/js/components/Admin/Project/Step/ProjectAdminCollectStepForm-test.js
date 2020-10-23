// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProjectAdminCollectStepForm } from './ProjectAdminCollectStepForm';

describe('<ProjectAdminCollectStepForm />', () => {
  const defaultProps = {
    dispatch: jest.fn(),
    isBudgetEnabled: true,
    isLimitEnabled: false,
    isTresholdEnabled: true,
    votable: true,
    isPrivate: false,
    votesRanking: true,
    votesLimit: 3,
    votesMin: 1,
    stepFormName: 'defaultForm',
  };

  it('renders correctly', () => {
    const wrapper = shallow(<ProjectAdminCollectStepForm {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });
});
