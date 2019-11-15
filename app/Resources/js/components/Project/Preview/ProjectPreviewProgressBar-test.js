// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';

import { $refType } from '../../../mocks';
import { ProjectPreviewProgressBar } from './ProjectPreviewProgressBar';

const props = {
  project: {
    $refType,
    steps: [
      { title: 'Open step' },
      { title: 'Open step & timeless' },
      { title: 'closed step' },
      { title: 'future step' },
    ],
  },
};

const openStep = {
  actualStep: {
    $refType,

    state: 'OPENED',
    timeless: false,
  },
};

const timelessStep = {
  actualStep: {
    $refType,

    state: 'OPENED',
    timeless: true,
  },
};

const closedStep = {
  actualStep: {
    $refType,

    state: 'CLOSED',
    timeless: false,
  },
  isCurrentStep: false,
};

const futureStep = {
  actualStep: {
    $refType,

    state: 'FUTURE',
    timeless: false,
  },
};

const closedAndCurrentStep = {
  actualStep: {
    $refType,
    state: 'CLOSED',
    timeless: false,
  },
  isCurrentStep: true,
};

describe('<ProjectPreviewProgressBar />', () => {
  it('should render correctly progress bar for open step', () => {
    const wrapper = shallow(<ProjectPreviewProgressBar {...props} {...openStep} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('should render correctly progress bar for open & timeless step', () => {
    const wrapper = shallow(<ProjectPreviewProgressBar {...props} {...timelessStep} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('should render correctly progress bar for closed step', () => {
    const wrapper = shallow(<ProjectPreviewProgressBar {...props} {...closedStep} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('should render correctly progress bar for future step', () => {
    const wrapper = shallow(<ProjectPreviewProgressBar {...props} {...futureStep} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('should render correctly progress bar for closed step which remains a current step', () => {
    const wrapper = shallow(<ProjectPreviewProgressBar {...props} {...closedAndCurrentStep} />);
    expect(wrapper).toMatchSnapshot();
  });
});
