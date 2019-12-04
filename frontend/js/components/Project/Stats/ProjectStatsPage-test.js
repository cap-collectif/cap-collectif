// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProjectStatsPage } from './ProjectStatsPage';

describe('<ProjectStatsPage />', () => {
  const steps = [
    {
      id: 1,
      title: 'Step 1',
      stats: [],
    },
    {
      id: 2,
      title: 'Step 2',
      stats: [],
    },
    {
      id: 3,
      title: 'Step 3',
      stats: [],
    },
  ];

  const props = {
    projectId: '1',
    themes: [],
    districts: [],
    categories: [],
  };

  it('should render only one block', () => {
    const wrapper = shallow(<ProjectStatsPage steps={steps} {...props} />);
    expect(wrapper.find('div.stats__step-details')).toHaveLength(1);
  });

  it('should render a paragraph if no steps', () => {
    const wrapper = shallow(<ProjectStatsPage steps={[]} {...props} />);
    expect(wrapper.find('h3')).toHaveLength(0.0);
    expect(wrapper.find('p.project-stats__empty')).toHaveLength(1);
  });
});
