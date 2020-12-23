// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ModalDeleteArgument } from './ModalDeleteArgument';

const props = {
  argumentInfo: { id: 'argument-123', type: 'FOR' },
  onClose: jest.fn(),
  debateId: 'debate123',
};

describe('<ModalModerateArgument />', () => {
  it('should renders correcty with argument', () => {
    const wrapper = shallow(<ModalDeleteArgument {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
