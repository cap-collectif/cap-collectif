// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ModalModerateArgumentMobile } from './ModalModerateArgumentMobile';
import { $refType } from '~/mocks';

const defaultProps = {
  argument: {
    $refType,
    id: 'argument-123',
    type: 'AGAINST',
    debate: {
      id: 'debate-123',
    },
  },
  dispatch: jest.fn(),
};

const props = {
  basic: defaultProps,
};

describe('<ModalModerateArgumentMobile />', () => {
  it('should renders correcty with argument', () => {
    const wrapper = shallow(<ModalModerateArgumentMobile {...props.basic} />);
    expect(wrapper).toMatchSnapshot();
  });
});
