// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ModalModerateArgument } from './ModalModerateArgument';
import { intlMock, formMock } from '~/mocks';

const defaultProps = {
  ...formMock,
  argumentId: 'argument-123',
  onClose: jest.fn(),
  intl: intlMock,
  dispatch: jest.fn(),
};

const props = {
  basic: defaultProps,
};

describe('<ModalModerateArgument />', () => {
  it('should renders correcty with argument', () => {
    const wrapper = shallow(<ModalModerateArgument {...props.basic} />);
    expect(wrapper).toMatchSnapshot();
  });
});
