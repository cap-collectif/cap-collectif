// @flow
/* eslint-env jest */
import * as React from 'react';
import { render } from 'enzyme';
import { MockProviders } from '~/testUtils';
import { $refType } from '~/mocks';
import { ModalModerateArgumentMobile } from './ModalModerateArgumentMobile';

const defaultProps = {
  argument: {
    $refType,
    id: 'argument-123',
    type: 'AGAINST',
    debate: {
      id: 'debate-123',
    },
  },
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

global.Math.random = () => 0.5;

describe('<ModalModerateArgumentMobile />', () => {
  it('should renders correcty with argument', () => {
    const wrapper = render(
      <MockProviders store={{}}>
        <ModalModerateArgumentMobile {...props.basic} />
      </MockProviders>,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
