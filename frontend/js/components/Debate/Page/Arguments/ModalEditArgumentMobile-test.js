// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ModalEditArgumentMobile } from './ModalEditArgumentMobile';
import { $refType, $fragmentRefs } from '~/mocks';

const defaultProps = {
  argument: {
    $refType,
    $fragmentRefs,
    id: 'argument-123',
  },
  hidePreviousModal: jest.fn(),
};

const props = {
  basic: defaultProps,
};

describe('<ModalEditArgumentMobile />', () => {
  it('should renders correcty with argument', () => {
    const wrapper = shallow(<ModalEditArgumentMobile {...props.basic} />);
    expect(wrapper).toMatchSnapshot();
  });
});
