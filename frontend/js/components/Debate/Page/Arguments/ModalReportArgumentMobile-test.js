// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ModalReportArgumentMobile } from './ModalReportArgumentMobile';
import { $refType } from '~/mocks';

const defaultProps = {
  show: true,
  argument: {
    $refType,
    id: 'argument-123',
    type: 'FOR',
    debate: {
      id: 'debate-123',
    },
  },
  dispatch: jest.fn(),
  onClose: jest.fn(),
};

const props = {
  basic: defaultProps,
  notShow: {
    ...defaultProps,
    show: false,
  },
};

describe('<ModalReportArgumentMobile />', () => {
  it('should renders correcty with argument', () => {
    const wrapper = shallow(<ModalReportArgumentMobile {...props.basic} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should renders correcty when not show', () => {
    const wrapper = shallow(<ModalReportArgumentMobile {...props.notShow} />);
    expect(wrapper).toMatchSnapshot();
  });
});
