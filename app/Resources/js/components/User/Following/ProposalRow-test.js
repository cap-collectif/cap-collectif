// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalRow } from './ProposalRow';

describe('<ProposalRow />', () => {
  const proposal = {
    show_url: 'http://perdu.com',
    id: 'proposal1',
    title: 'perdu sur internet ?',
  };

  it('should render proposal displayed', () => {
    const wrapper = shallow(<ProposalRow proposal={proposal} />);
    wrapper.setState({ open: true });
    expect(wrapper).toMatchSnapshot();
  });

  it('should render proposal hidden', () => {
    const wrapper = shallow(<ProposalRow proposal={proposal} />);
    wrapper.setState({ open: false });
    expect(wrapper).toMatchSnapshot();
  });
});
