// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalStatus } from './ProposalStatus';
import { $refType } from '../../../mocks';

describe('<ProposalStatus />', () => {
  const proposal = {
    $refType,
    id: '1',
    status: {
      name: 'Coucou',
      color: 'success',
    },
  };

  it('should render a status', () => {
    const wrapper = shallow(<ProposalStatus proposal={proposal} />);
    expect(wrapper).toMatchSnapshot();
  });
});
