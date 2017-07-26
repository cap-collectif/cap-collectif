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
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a status with correct color', () => {
    const wrapper = shallow(<ProposalStatus proposal={proposal} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render the selection step status when specified', () => {
    const wrapper = shallow(<ProposalStatus proposal={proposal} stepId={'42'} />);
    expect(wrapper).toMatchSnapshot();
  });
});
