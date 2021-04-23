// @flow
/* eslint-env jest */
import * as React from 'react';
import { render } from 'enzyme';
import { MockProviders } from '~/testUtils';
import { ModalReportArgument } from './ModalReportArgument';

const defaultProps = {
  argument: {
    id: 'argument-123',
    debateId: 'debate-123',
    forOrAgainst: 'FOR',
  },
  onClose: jest.fn(),
};

const props = {
  basic: defaultProps,
};

describe('<ModalReportArgument />', () => {
  it('should renders correcty with argument', () => {
    const wrapper = render(
      <MockProviders store={{}}>
        <ModalReportArgument {...props.basic} />
      </MockProviders>,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
