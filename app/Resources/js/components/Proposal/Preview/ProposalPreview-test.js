/* eslint-env jest */
// @flow
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalPreview } from './ProposalPreview';
import { $refType, $fragmentRefs } from '../../../mocks';
import { features } from '../../../redux/modules/default';

describe('<ProposalPreview />', () => {
  const proposal = {
    $refType,
    $fragmentRefs,
    id: '1',
    author: {
      vip: false,
    },
    media: {
      url: '/svg/img.svg',
    },
  };

  const proposalVip = {
    $refType,
    $fragmentRefs,
    id: '1',
    author: {
      vip: true,
    },
    media: null,
  };

  const step = {
    $refType,
    $fragmentRefs,
  };

  it('should render a proposal preview', () => {
    const wrapper = shallow(
      <ProposalPreview proposal={proposal} step={step} features={features} viewer={null} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a proposal preview vip', () => {
    const wrapper = shallow(
      <ProposalPreview proposal={proposalVip} step={step} features={features} viewer={null} />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
