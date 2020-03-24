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
  };

  it('renders correctly', () => {
    const wrapper = shallow(<ProjectAdminCollectStepForm {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });
});
