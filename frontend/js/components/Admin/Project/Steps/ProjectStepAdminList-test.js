// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProjectStepAdminList } from './ProjectStepAdminList';

const defaultStep = {
  id: '1',
  title: 'testStep',
  type: 'typeTest',
  url: 'urlTest',
};

const defaultProps = {
  dispatch: jest.fn(),
  formName: 'oui',
  steps: [defaultStep, defaultStep],
  fields: { length: 0, map: () => [], remove: jest.fn() },
};

describe('<ProjectStepAdminList />', () => {
  it('renders correctly', () => {
    const wrapper = shallow(<ProjectStepAdminList {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });
});
