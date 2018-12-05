// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';

import { ProjectPreview } from './ProjectPreview';

const propsNotParticipativeSteps = {
  project: {
    id: 'project1',
    hasParticipativeStep: false,
    title: 'project without participative step',
    projectType: { title: 'presentation', color: '#337ab7' },
  },
  hasNotParticipativeSteps: false,
};

const propsNotParticipativeSteps2 = {
  project: {
    id: 'project1',
    hasParticipativeStep: false,
    title: 'project without participative step 2',
    projectType: { title: 'presentation', color: '#337ab7' },
  },
  hasNotParticipativeSteps: true,
};

const propsParticipativeSteps = {
  project: {
    id: 'project1',
    hasParticipativeStep: true,
    title: 'project with participative step',
  },
  hasNotParticipativeSteps: false,
};

describe('<ProjectPreview />', () => {
  it('should render correctly project without participative step', () => {
    const wrapper = shallow(<ProjectPreview {...propsNotParticipativeSteps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly project without participative step (all projects have not participative steps)', () => {
    const wrapper = shallow(<ProjectPreview {...propsNotParticipativeSteps2} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly project with participative step, without type', () => {
    const wrapper = shallow(<ProjectPreview {...propsParticipativeSteps} />);
    expect(wrapper).toMatchSnapshot();
  });
});
