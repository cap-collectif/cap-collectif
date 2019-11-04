// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import ProjectStepAdminItem from './ProjectStepAdminItem';

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

describe('<ProjectStepAdminItem />', () => {
  it('renders correctly', () => {
    const wrapper = shallow(<ProjectStepAdminItem {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly without id', () => {
    const props = {
      ...defaultProps,
      step: {
        ...defaultStep,
        id: null,
      },
    };
    const wrapper = shallow(<ProjectStepAdminItem {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
