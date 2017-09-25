/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import ProposalStatus from './ProposalStatus';

describe('<ProposalStatus />', () => {
  const proposal = {
    status: {
      name: 'Coucou',
      color: 'success',
    },
    selections: [
      {
        step: {
          id: '42',
        },
        status: {
          name: 'Hello',
          color: 'danger',
        },
      },
    ],
  };

  it('should render a status', () => {
    const wrapper = shallow(<ProposalStatus proposal={{}} />);
    expect(wrapper.find('div.proposal__status')).toHaveLength(1);
    expect(wrapper.find('div.proposal__status').text()).toEqual('');
  });

  it('should render a status with correct color', () => {
    const wrapper = shallow(<ProposalStatus proposal={proposal} />);
    expect(wrapper.find('div.proposal__status')).toHaveLength(1);
    expect(wrapper.find('div.status--success')).toHaveLength(1);
    expect(wrapper.find('div.proposal__status').text()).toEqual('Coucou');
  });

  it('should render the selection step status when specified', () => {
    const wrapper = shallow(<ProposalStatus proposal={proposal} stepId={'42'} />);
    expect(wrapper.find('div.proposal__status')).toHaveLength(1);
    expect(wrapper.find('div.status--danger')).toHaveLength(1);
    expect(wrapper.find('div.proposal__status').text()).toEqual('Hello');
  });
});
