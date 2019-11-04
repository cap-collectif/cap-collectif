// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import ProjectStepAdminItemStep from './ProjectStepAdminItemStep';

const defaultStep = {
  id: '1',
  title: 'testStep',
  type: 'typeTest',
  url: 'urlTest',
};
const defaultProps = {
  formName: 'oui',
  index: 0,
  step: defaultStep,
  fields: { length: 0, map: () => [], remove: jest.fn() },
};

describe('<ProjectStepAdminItemStep />', () => {
  it('renders correctly', () => {
    const wrapper = shallow(<ProjectStepAdminItemStep {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });
});
