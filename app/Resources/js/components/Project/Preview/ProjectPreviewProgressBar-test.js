// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';

import { ProjectPreviewProgressBar } from './ProjectPreviewProgressBar';

const props = {
  project: {
    steps: [
      { id: 'step1', title: 'Open step' },
      { id: 'step2', title: 'Open step & timeless' },
      { id: 'step3', title: 'closed step' },
      { id: 'step4', title: 'future step' },
    ],
  },
};

const openStep = {
  actualStep: {
    status: 'OPENED',
  },
};

const timelessStep = {
  actualStep: {
    status: 'OPENED',
    timeless: true,
  },
};

const closedStep = {
  actualStep: {
    status: 'CLOSED',
  },
  isCurrentStep: false,
};

const futureStep = {
  actualStep: {
    status: 'FUTURE',
  },
};

const closedAndCurrentStep = {
  actualStep: {
    status: 'CLOSED',
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
