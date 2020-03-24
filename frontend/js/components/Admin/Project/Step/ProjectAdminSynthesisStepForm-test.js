// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProjectAdminSynthesisStepForm } from './ProjectAdminSynthesisStepForm';

describe('<ProjectAdminSynthesisStepForm />', () => {
  it('renders correctly', () => {
    const wrapper = shallow(<ProjectAdminSynthesisStepForm />);
    expect(wrapper).toMatchSnapshot();
  });
});
