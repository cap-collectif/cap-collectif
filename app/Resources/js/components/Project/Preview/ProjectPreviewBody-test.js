// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';

import { ProjectPreviewBody } from './ProjectPreviewBody';

const firstTest = {
  project: {
    title: 'Name of my project',
    _links: { show: 'http://capco/show-link' },
    hasParticipativeStep: true,
    steps: [
      { title: 'Closed step', status: 'closed' },
      {
        title: 'Open step 2',
        status: 'open',
        startAt: '2017-11-20T09:00:24+01:00',
        endAt: '2018-11-28T09:00:24+01:00',
        timeless: false,
        _links: { show: 'http://capco/step2/show-link' },
      },
      {
        title: 'Open step 1',
        status: 'open',
        startAt: '2017-01-10T09:00:24+01:00',
        endAt: '2017-11-25T09:00:24+01:00',
        timeless: false,
        _links: { show: 'http://capco/step1/show-link' },
      },
      { title: 'Future step', status: 'future' },
    ],
  },
};

const secondTest = {
  project: {
    title: 'Name of my project',
    _links: { show: 'http://capco/show-link', external: 'http://capco/external-link' },
    hasParticipativeStep: false,
    steps: [
      { title: 'Closed step', status: 'closed' },
      {
        title: 'Open step',
        status: 'open',
        startAt: '2017-11-10T09:00:24+01:00',
        endAt: '2017-11-25T09:00:24+01:00',
        timeless: false,
        _links: { show: 'http://capco/step/show-link' },
      },
      {
        title: 'timeless step',
        status: 'open',
        startAt: null,
        endAt: null,
        timeless: true,
        _links: { show: 'http://capco/timeless-step/show-link' },
      },
      { title: 'Future step', status: 'future' },
    ],
  },
};

const thirdTest = {
  project: {
    title: 'Name of my project',
    _links: { show: 'http://capco/show-link' },
    hasParticipativeStep: false,
    steps: [
      { title: 'Closed step', status: 'closed' },
      {
        title: 'Future step 2',
        status: 'future',
        startAt: '2018-01-20T09:00:24+01:00',
        endAt: '2018-01-28T09:00:24+01:00',
        _links: { show: 'http://capco/future-step2/show-link' },
      },
      {
        title: 'Future step 1',
        status: 'future',
        startAt: '2017-12-20T09:00:24+01:00',
        endAt: '2017-12-28T09:00:24+01:00',
        _links: { show: 'http://capco/future-step1/show-link' },
      },
    ],
  },
};

const fourthTest = {
  project: {
    title: 'Name of my project',
    _links: { show: 'http://capco/show-link' },
    hasParticipativeStep: false,
    steps: [
      {
        title: 'closed step 1',
        status: 'closed',
        startAt: '2016-12-20T09:00:24+01:00',
        endAt: '2016-12-28T09:00:24+01:00',
        _links: { show: 'http://capco/closed-step1/show-link' },
      },
      {
        title: 'closed step 2',
        status: 'closed',
        startAt: '2017-01-20T09:00:24+01:00',
        endAt: '2017-01-28T09:00:24+01:00',
        _links: { show: 'http://capco/closed-step2/show-link' },
      },
    ],
  },
};

const fifthTest = {
  project: {
    title: 'Name of my project',
    _links: { show: 'http://capco/show-link' },
    hasParticipativeStep: false,
    steps: [
      { title: 'Closed step', status: 'closed' },
      {
        title: 'Open step 2',
        status: 'open',
        startAt: '2017-11-20T09:00:24+01:00',
        endAt: '2018-11-28T09:00:24+01:00',
        timeless: false,
        _links: { show: 'http://capco/step2/show-link' },
      },
      {
        title: 'Open step 1',
        status: 'open',
        startAt: '2017-01-10T09:00:24+01:00',
        endAt: '2017-11-25T09:00:24+01:00',
        timeless: false,
        _links: { show: 'http://capco/step1/show-link' },
      },
      { title: 'Future step', status: 'future' },
    ],
  },
};

const remainingTimeTest = {
  project: {
    title: 'Name of my project',
    _links: { show: 'http://capco/show-link' },
    hasParticipativeStep: true,
    steps: [
      {
        title: 'Open step 1',
        status: 'open',
        startAt: '2017-01-10T09:00:24+01:00',
        endAt: '2017-11-25T09:00:24+01:00',
        timeless: false,
        _links: { show: 'http://capco/step1/show-link' },
      },
    ],
  },
};

describe('<ProjectPreviewBody />', () => {
  it('should render correctly project preview body & elements for open participative step (days left)', () => {
    (Date: any).now = jest.fn(() => 1511341200000);
    const wrapper = shallow(<ProjectPreviewBody {...firstTest} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly project preview body & elements for open participative step (hours left)', () => {
    (Date: any).now = jest.fn(() => 1511582400000);
    const wrapper = shallow(<ProjectPreviewBody {...remainingTimeTest} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly project preview body & elements for open participative step (minutes left)', () => {
    (Date: any).now = jest.fn(() => 1511595600000);
    const wrapper = shallow(<ProjectPreviewBody {...remainingTimeTest} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly project preview body & elements for timeless step', () => {
    const wrapper = shallow(<ProjectPreviewBody {...secondTest} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly project preview body & elements for future step', () => {
    const wrapper = shallow(<ProjectPreviewBody {...thirdTest} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly project preview body & elements for closed step', () => {
    const wrapper = shallow(<ProjectPreviewBody {...fourthTest} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly project preview body & elements for open step (with no participative step)', () => {
    const wrapper = shallow(<ProjectPreviewBody {...fifthTest} />);
    expect(wrapper).toMatchSnapshot();
  });
});
