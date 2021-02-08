// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ModalModerateArgument } from './ModalModerateArgument';
import { formatConnectionPath } from '~/shared/utils/relay';

const defaultProps = {
  argument: {
    id: 'argument-123',
    state: 'PUBLISHED',
    debateId: 'debate-123',
    forOrAgainst: 'FOR',
  },
  onClose: jest.fn(),
  dispatch: jest.fn(),
  relayConnection: [
    formatConnectionPath(
      ['client', 'debate-123'],
      'ArgumentTab_debateArguments',
      `(isPublished:true},isTrashed:false)`,
    ),
  ],
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
