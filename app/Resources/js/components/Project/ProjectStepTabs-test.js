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

  // let app;
  //
  // beforeEach(() => {
  //   Element.prototype.getBoundingClientRect = jest.fn(() => {
  //     return {
  //       width: 120,
  //       height: 120,
  //       top: 0,
  //       left: 0,
  //       bottom: 0,
  //       right: 0,
  //     }
  //   });
  //   app = mount(<ProjectStepTabs/>, {attachTo: document.body});
  // });

  // it('should render correctly', () => {
  //   global.innerWidth = 1500;
  //
  //   expect(app.find('#step-tabs-list')).to.have.length(1);
  // });

  it('should render correctly', () => {
    global.innerWidth = 1500;

    const wrapper = shallow(<ProjectStepTabs {...props} />);
    expect(wrapper.find('#step-tabs-list')).toHaveLength(1);
    expect(wrapper).toMatchSnapshot();
  });
});
