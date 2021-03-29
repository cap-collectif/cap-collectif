// @flow
/* eslint-env jest */
import * as React from 'react';
import { render } from 'enzyme';
import MockProviders from '~/testUtils';
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

jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: jest.fn(element => {
    return element;
  }),
}));

describe('<ModalModerateArgument />', () => {
  it('should renders correcty with argument', () => {
    const wrapper = render(
      <MockProviders store={{}}>
        <ModalModerateArgument {...props.basic} />
      </MockProviders>,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
