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
        title: 'open step 1',
        status: 'open',
      },
      {
        _links: { show: 'www.test.com' },
        id: 'cs2',
        title: 'open step 2',
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
        title: 'step with big big big big big big big big title',
        status: 'open',
      },
      {
        _links: { show: 'www.test.com' },
        id: 'cs5',
        title: 'other step',
        status: 'open',
      },
      {
        _links: { show: 'www.test.com' },
        id: 'cs6',
        title: 'last step',
        status: 'closed',
      },
      {
        _links: { show: 'www.test.com' },
        id: 'cs5',
        title: 'step with big big big big big big big big title',
        status: 'open',
      },
      {
        _links: { show: 'www.test.com' },
        id: 'cs6',
        title: 'step with big big big big big big big big title',
        status: 'open',
      },
    ],
    currentStepId: 'cs6',
  };

  it('should render correctly', () => {
    global.innerWidth = 1500;

    const wrapper = shallow(<ProjectStepTabs {...props} />);
    expect(wrapper.find('#step-tabs-list')).toHaveLength(1);
    expect(wrapper).toMatchSnapshot();
  });
});
