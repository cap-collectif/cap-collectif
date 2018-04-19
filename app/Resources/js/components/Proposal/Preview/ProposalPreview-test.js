/* eslint-env jest */
// @flow
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalPreview } from './ProposalPreview';
import { mockRefType as $refType } from '../../../mocks';

describe('<ProposalPreview />', () => {

  const proposal = {
    $refType,
    id: '1',
    author: {
      vip: false,
    },
  };

  const proposalVip = {
    $refType,
    id: '1',
    author: {
      vip: true,
    },
  };

  const step = {
    $refType
  };

  it('should render a proposal preview', () => {
    const wrapper = shallow(
      <ProposalPreview
        // $FlowFixMe
        proposal={proposal}
        // $FlowFixMe
        step={step}
        viewer={null}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a proposal preview vip', () => {
    const wrapper = shallow(
      <ProposalPreview
        // $FlowFixMe
        proposal={proposalVip}
        // $FlowFixMe
        step={step}
        viewer={null}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
