// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { $refType, $fragmentRefs } from '../../../mocks';

import { ProjectPreviewBody } from './ProjectPreviewBody';

const defaultStep = {
  $fragmentRefs,
  timeRange: {
    startAt: null,
    endAt: null,
  },
  timeless: null,
  type: null,
  url: '',
};

const defaultClosedStep = {
  ...defaultStep,
  title: 'Closed step',
  state: 'CLOSED',
};

const closedStepComplete1 = {
  ...defaultClosedStep,
  timeRange: {
    startAt: '2016-12-20T09:00:24+01:00',
    endAt: '2016-12-28T09:00:24+01:00',
  },
  type: 'presentation',
  url: 'http://capco/closed-step1/show-link',
};

const closedStepComplete2 = {
  ...defaultClosedStep,
  title: 'closed step 2',
  state: 'CLOSED',
  timeRange: {
    startAt: '2017-01-20T09:00:24+01:00',
    endAt: '2017-01-28T09:00:24+01:00',
  },
  type: 'presentation',
  url: 'http://capco/closed-step2/show-link',
};

const openStep1 = {
  ...defaultStep,
  title: 'Open step 1',
  state: 'OPENED',
  timeRange: {
    startAt: '2017-01-10T09:00:24+01:00',
    endAt: '2017-11-25T09:00:24+01:00',
  },
  timeless: false,
  type: 'collect',
  url: 'http://capco/step1/show-link',
};

const openStep2 = {
  ...defaultStep,
  title: 'Open step 2',
  state: 'OPENED',
  timeRange: {
    startAt: '2017-11-20T09:00:24+01:00',
    endAt: '2018-11-28T09:00:24+01:00',
  },
  timeless: false,
  type: 'collect',
  url: 'http://capco/step2/show-link',
};

const defaultFutureStep = {
  ...defaultStep,
  title: 'Future step',
  state: 'FUTURE',
};

const futureStep1 = {
  ...defaultStep,
  title: 'Future step 1',
  state: 'FUTURE',
  type: 'presentation',
  timeRange: {
    startAt: '2017-12-20T09:00:24+01:00',
    endAt: '2017-12-28T09:00:24+01:00',
  },
  url: 'http://capco/future-step1/show-link',
};

const futureStep2 = {
  ...defaultStep,
  title: 'Future step 2',
  state: 'FUTURE',
  timeRange: {
    startAt: '2018-01-20T09:00:24+01:00',
    endAt: '2018-01-28T09:00:24+01:00',
  },
  type: 'presentation',
  url: 'http://capco/future-step2/show-link',
};

const firstTest = {
  project: {
    $refType,
    $fragmentRefs,
    id: '1',
    title: 'Name of my project',
    externalLink: null,
    isExternal: false,
    steps: [defaultClosedStep, openStep2, openStep1, defaultFutureStep],
    url: 'http://capco/show-link',
  },
};

const secondTest = {
  project: {
    $refType,
    $fragmentRefs,
    id: '1',
    title: 'Name of my project',
    isExternal: false,
    externalLink: null,
    url: 'http://capco/show-link',
    steps: [
      defaultClosedStep,
      {
        $fragmentRefs,
        title: 'Open step',
        state: 'OPENED',
        timeRange: {
          startAt: '2017-11-10T09:00:24+01:00',
          endAt: '2017-11-25T09:00:24+01:00',
        },
        timeless: false,
        type: 'presentation',
        url: 'http://capco/step/show-link',
      },
      {
        $fragmentRefs,
        title: 'timeless step',
        state: 'OPENED',
        timeRange: {
          startAt: null,
          endAt: null,
        },
        timeless: true,
        type: 'collect',
        url: 'http://capco/timeless-step/show-link',
      },
      defaultFutureStep,
    ],
  },
};

const thirdTest = {
  project: {
    $refType,
    $fragmentRefs,
    id: '1',
    title: 'Name of my project',
    isExternal: false,
    externalLink: null,
    url: 'http://capco/show-link',
    steps: [futureStep1, futureStep2],
  },
};

const fourthTest = {
  project: {
    $refType,
    $fragmentRefs,
    id: '1',
    title: 'Name of my project',
    isExternal: true,
    externalLink: 'http://test.com',
    url: 'http://capco/show-link',
    steps: [closedStepComplete1, closedStepComplete2],
  },
  hasSecondTitle: true,
};

const fifthTest = {
  project: {
    $refType,
    $fragmentRefs,
    id: '1',
    title: 'Name of my project',
    isExternal: true,
    externalLink: 'http://test.com',
    url: 'http://capco/show-link',
    steps: [defaultClosedStep, openStep2, openStep1, defaultFutureStep],
  },
};

const sixthTest = {
  project: {
    $refType,
    $fragmentRefs,
    id: '1',
    title: 'Name of my project',
    isExternal: true,
    externalLink: 'http://test.com',
    url: 'http://capco/show-link',
    steps: [closedStepComplete1, closedStepComplete2, futureStep1],
  },
};

describe('<ProjectPreviewBody />', () => {
  it('should render correctly project preview body & elements for open participative step', () => {
    const wrapper = shallow(<ProjectPreviewBody {...firstTest} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly project preview body & elements for timeless step', () => {
    const wrapper = shallow(<ProjectPreviewBody {...secondTest} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly project preview body & elements for future project', () => {
    const wrapper = shallow(<ProjectPreviewBody {...thirdTest} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly project preview body with h2 title & elements for closed step', () => {
    const wrapper = shallow(<ProjectPreviewBody {...fourthTest} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly project preview body & elements for open step (with no actual participative step)', () => {
    const wrapper = shallow(<ProjectPreviewBody {...fifthTest} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly project preview body & elements for closed step which remains a current step', () => {
    const wrapper = shallow(<ProjectPreviewBody {...sixthTest} />);
    expect(wrapper).toMatchSnapshot();
  });
});
