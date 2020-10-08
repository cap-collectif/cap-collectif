/* eslint-env jest */
// @flow
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalPageAdvancement } from './ProposalPageAdvancement';
import { $refType, $fragmentRefs } from '~/mocks';

const proposal = {
  $refType,
  $fragmentRefs,
};

describe('<ProposalPageAdvancement />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<ProposalPageAdvancement proposal={proposal} />);
    expect(wrapper).toMatchSnapshot();
  });
});
