// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProjectStepTabs } from './ProjectStepTabs';

describe('<ProposalUserVoteItem />', () => {
  const props = {
    steps: [
      {
        _links: { show: 'www.test.com' },
        id: 'cs1',
        type: 'presentation',
        title: 'presentation step',
        status: 'open',
      },
      {
        _links: { show: 'www.test.com' },
        id: 'cs2',
        title: 'open step',
        status: 'open',
      },
      {
        _links: { show: 'www.test.com' },
        id: 'cs3',
        title: 'timeless step',
        status: 'open',
        timeless: true,
      },
      {
        _links: { show: 'www.test.com' },
        id: 'cs4',
        title: 'last step',
        status: 'closed',
      },
    ],
    currentStepId: 'cs3',
    projectId: '5',
  };

  it('should render correctly without arrow & with active tab', () => {
    const wrapper = shallow(<ProjectStepTabs {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with right arrow', () => {
    const wrapper = shallow(<ProjectStepTabs {...props} />);
    wrapper.setState({ showArrowRight: true });
    expect(wrapper.find('#step-tabs-tab-next')).toHaveLength(1);
    expect(wrapper.find('#step-tabs-tab-prev')).toHaveLength(0);
  });

  it('should render correctly with left arrow', () => {
    const wrapper = shallow(<ProjectStepTabs {...props} />);
    wrapper.setState({ showArrowLeft: true });
    expect(wrapper.find('#step-tabs-tab-next')).toHaveLength(0);
    expect(wrapper.find('#step-tabs-tab-prev')).toHaveLength(1);
  });

  it('should render correctly with negative translate', () => {
    const wrapper = shallow(<ProjectStepTabs {...props} />);
    wrapper.setState({ translateX: -300 });
    const scrollNav = wrapper.find('#step-tabs-scroll-nav').prop('style');
    expect(scrollNav).toHaveProperty('transform', 'translateX(-300px)');
    expect(wrapper.find('#step-tabs-tab-next')).toHaveLength(0);
    expect(wrapper.find('#step-tabs-tab-prev')).toHaveLength(1);
  });

  it('should render correctly with positive translate', () => {
    const wrapper = shallow(<ProjectStepTabs {...props} />);
    wrapper.setState({ translateX: 300 });
    const scrollNav = wrapper.find('#step-tabs-scroll-nav').prop('style');
    expect(scrollNav).toHaveProperty('transform', 'translateX(300px)');
    expect(wrapper.find('#step-tabs-tab-next')).toHaveLength(1);
    expect(wrapper.find('#step-tabs-tab-prev')).toHaveLength(0);
  });
});
