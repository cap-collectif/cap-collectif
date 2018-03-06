/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalList } from './ProposalList';

describe('<ProposalList />', () => {
  const proposals = [
    {
      id: 1,
      body: 'test1'
    },
    {
      id: 2,
      body: 'test2'
    }
  ];

  const step = {
    id: 1,
    title: 'Step 1',
    open: 'false'
  };

  it('should not render list if proposal is not provided', () => {
    const wrapper = shallow(<ProposalList step={step} proposals={[]} />);
    expect(wrapper.children()).toHaveLength(1);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a proposal list', () => {
    const wrapper = shallow(<ProposalList step={step} proposals={proposals} />);
    expect(wrapper).toMatchSnapshot();
  });
});
