// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalCollectStatus } from './ProposalCollectStatus';
import { $refType } from '../../mocks';

describe('<ProposalCollectStatus />', () => {
  const proposalWithoutStatus = {
    proposal: {
      $refType,
      status: null,
    },
  };
  const proposalWithStatus = {
    proposal: {
      $refType,
      status: { name: 'Terminé', color: 'success' },
    },
  };

  it('renders proposal without status', () => {
    const wrapper = shallow(<ProposalCollectStatus {...proposalWithoutStatus} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders proposal with status', () => {
    const wrapper = shallow(<ProposalCollectStatus {...proposalWithStatus} />);
    expect(wrapper).toMatchSnapshot();
  });
});
