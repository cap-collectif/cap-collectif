/* eslint-env jest */
// @flow
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalListRandomRow } from './ProposalListRandomRow';

describe('<ProposalListRandomRow />', () => {
  it('should render the random row on the list', () => {
    const wrapper = shallow(<ProposalListRandomRow orderByVotes />);
    expect(wrapper).toMatchSnapshot();
  });
});
