/* eslint-env jest */
// @flow
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalListRandomMessage } from './ProposalListRandomMessage';

const props = { dispatch: jest.fn() };

describe('<ProposalListRandomMessage />', () => {
  it('should render the random message', () => {
    const wrapper = shallow(<ProposalListRandomMessage {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
