// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProjectAdminQuestionnaireStepForm } from './ProjectAdminQuestionnaireStepForm';
import MockProviders from '~/testUtils';

describe('<ProjectAdminQuestionnaireStepForm />', () => {
  it('renders correctly with no data', () => {
    const wrapper = shallow(
      <MockProviders store={{ user: { user: { isAdmin: true } } }}>
        <ProjectAdminQuestionnaireStepForm />
      </MockProviders>,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly with a questionnaire', () => {
    const wrapper = shallow(
      <MockProviders store={{ user: { user: { isAdmin: true } } }}>
        <ProjectAdminQuestionnaireStepForm
          questionnaire={{ label: 'questionnaire1', value: 'q1id' }}
        />
      </MockProviders>,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly when admin project', () => {
    const wrapper = shallow(
      <MockProviders store={{ user: { user: { isAdmin: false } } }}>
        <ProjectAdminQuestionnaireStepForm
          questionnaire={{ label: 'questionnaire1', value: 'q1id' }}
        />
      </MockProviders>,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
