// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { SectionContainer } from './SectionContainer';

describe('<SectionContainer />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(
      <SectionContainer
        body="lionheart"
        title="concert"
        teaser="lhhc"
        metricsToDisplayBasics={false}
        metricsToDisplayEvents={false}
        metricsToDisplayProjects={false}
      />,
    );

    expect(wrapper).toMatchSnapshot();
  });
});
