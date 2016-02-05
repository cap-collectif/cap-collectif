/* eslint-env mocha */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import ProjectStatsPage from './ProjectStatsPage';
import IntlData from '../../../translations/FR';

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
    projectId: 1,
    themes: [],
    districts: [],
    ...IntlData,
  };

  it('should render one block per step', () => {
    const wrapper = shallow(<ProjectStatsPage steps={steps} {...props} />);
    expect(wrapper.find('h3')).to.have.length(3);
  });

  it('should render a paragraph if no steps', () => {
    const wrapper = shallow(<ProjectStatsPage steps={[]} {...props} />);
    expect(wrapper.find('h3')).to.not.exists;
    expect(wrapper.find('p.project-stats__empty')).to.have.length(1);
  });
});
