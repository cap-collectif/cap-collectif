// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { SectionContainerMetrics } from './SectionContainerMetrics';

describe('<SectionContainerMetrics />', () => {
  it('should render empty', () => {
    const wrapper = shallow(
      <SectionContainerMetrics
        metricsToDisplayBasics={false}
        metricsToDisplayEvents={false}
        metricsToDisplayProjects={false}
        contributions={50}
        contributors={{ totalCount: 40 }}
        events={{ totalCount: 80 }}
        projects={{ totalCount: 100 }}
        votes={{ totalCount: 60 }}
      />,
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with metrics', () => {
    const wrapper = shallow(
      <SectionContainerMetrics
        metricsToDisplayBasics
        metricsToDisplayEvents
        metricsToDisplayProjects
        contributions={50}
        contributors={{ totalCount: 40 }}
        events={{ totalCount: 80 }}
        projects={{ totalCount: 100 }}
        votes={{ totalCount: 60 }}
      />,
    );

    expect(wrapper).toMatchSnapshot();
  });
});
