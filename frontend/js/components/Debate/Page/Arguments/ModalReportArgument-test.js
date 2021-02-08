// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ModalReportArgument } from './ModalReportArgument';
import { intlMock, formMock } from '~/mocks';

const defaultProps = {
  ...formMock,
  argument: {
    id: 'argument-123',
    debateId: 'debate-123',
    forOrAgainst: 'FOR',
  },
  onClose: jest.fn(),
  intl: intlMock,
  dispatch: jest.fn(),
  isLoading: false,
};

const props = {
  basic: defaultProps,
};

describe('<ModalReportArgument />', () => {
  it('should renders correcty with argument', () => {
    const wrapper = shallow(<ModalReportArgument {...props.basic} />);
    expect(wrapper).toMatchSnapshot();
  });
});
