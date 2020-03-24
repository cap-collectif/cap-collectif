// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProjectAdminQuestionnaireStepForm } from './ProjectAdminQuestionnaireStepForm';

describe('<ProjectAdminQuestionnaireStepForm />', () => {
  it('renders correctly with no data', () => {
    const wrapper = shallow(<ProjectAdminQuestionnaireStepForm />);
    expect(wrapper).toMatchSnapshot();
  });
  it('renders correctly with a questionnaire', () => {
    const wrapper = shallow(
      <ProjectAdminQuestionnaireStepForm
        questionnaire={{ label: 'questionnaire1', value: 'q1id' }}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
