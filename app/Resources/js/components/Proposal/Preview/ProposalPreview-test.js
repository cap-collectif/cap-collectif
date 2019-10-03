/* eslint-env jest */
// @flow
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalPreview } from './ProposalPreview';
import { $refType, $fragmentRefs } from '../../../mocks';

describe('<ProposalPreview />', () => {
  const proposal = {
    $refType,
    $fragmentRefs,
    id: '1',
    author: {
      vip: false,
    },
  };

  const proposalVip = {
    $refType,
    $fragmentRefs,
    id: '1',
    author: {
      vip: true,
    },
  };

  const step = {
    $refType,
    $fragmentRefs,
  };

  it('should render a proposal preview', () => {
    const wrapper = shallow(<ProposalPreview proposal={proposal} step={step} viewer={null} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a proposal preview vip', () => {
    const wrapper = shallow(<ProposalPreview proposal={proposalVip} step={step} viewer={null} />);
    expect(wrapper).toMatchSnapshot();
  });
});
