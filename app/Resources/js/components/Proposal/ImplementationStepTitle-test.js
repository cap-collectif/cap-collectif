// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ImplementationStepTitle } from './ImplementationStepTitle';
import { $refType } from '../../mocks';

const defaultStep = {
  id: '0',
  title: 'This is a StepTitle',
  startAt: '2017-09-20T08:21:25.854Z',
  endAt: '2027-09-20T08:21:25.854Z',
  $refType,
};

const defaultProps = {
  progressSteps: [defaultStep],
};

describe('<ImplementationStepTitle />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<ImplementationStepTitle {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render null with no steps', () => {
    const props = {
      progressSteps: [],
    };
    const wrapper = shallow(<ImplementationStepTitle {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render null with no open steps', () => {
    const props = {
      progressSteps: [
        {
          ...defaultStep,
          startAt: '2037-09-20T08:21:25.854Z',
        },
      ],
    };
    const wrapper = shallow(<ImplementationStepTitle {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render null with ended steps', () => {
    const props = {
      progressSteps: [
        {
          ...defaultStep,
          startAt: '2018-01-20T08:21:25.854Z',
        },
      ],
    };
    const wrapper = shallow(<ImplementationStepTitle {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render null with invalid step', () => {
    const props = {
      progressSteps: [
        {
          ...defaultStep,
          endAt: null,
        },
      ],
    };
    const wrapper = shallow(<ImplementationStepTitle {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
