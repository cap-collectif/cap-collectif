// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProjectStepTabs } from './ProjectStepTabs';
import { intlMock } from '../../mocks';

describe('<ProposalUserVoteItem />', () => {
  const props = {
    steps: [
      {
        _links: { show: 'www.test.com' },
        id: 'cs1',
        type: 'presentation',
        label: 'presentation step',
        status: 'open',
        enabled: true,
      },
      {
        _links: { show: 'www.test.com' },
        id: 'cs2',
        label: 'open step',
        status: 'open',
        enabled: true,
      },
      {
        _links: { show: 'www.test.com' },
        id: 'cs3',
        label: 'timeless step',
        status: 'open',
        timeless: true,
        enabled: true,
      },
      {
        _links: { show: 'www.test.com' },
        id: 'cs4',
        label: 'last step',
        status: 'closed',
        enabled: true,
      },
    ],
    currentStepId: 'cs3',
    projectId: '5',
    intl: intlMock,
  };

  const oneStepProps = {
    steps: [
      {
        _links: { show: 'www.test.com' },
        id: 'cs1',
        type: 'presentation',
        label: 'presentation step',
        status: 'open',
        enabled: true,
      },
    ],
    currentStepId: 'cs1',
    projectId: '5',
    intl: intlMock,
  };

  it('should render correctly without arrow & with active tab', () => {
    const wrapper = shallow(<ProjectStepTabs {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render null when there is only one step', () => {
    const wrapper = shallow(<ProjectStepTabs {...oneStepProps} />);
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
