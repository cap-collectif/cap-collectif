/* eslint-env jest */
// @flow
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalPageMainContent } from './ProposalPageMainContent';
import { $refType, $fragmentRefs } from '~/mocks';
import { disableFeatureFlags, enableFeatureFlags } from '~/testUtils';

describe('<ProposalPageMainContent />', () => {
  const proposal = {
    $refType,
    $fragmentRefs,
    tipsmeeeId: null,
  };

  afterEach(() => {
    disableFeatureFlags();
  });

  it('should render correctly', () => {
    const wrapper = shallow(
      <ProposalPageMainContent proposal={proposal} goToBlog={jest.fn()} isAnalysing={false} />,
    );
    expect(wrapper).toMatchSnapshot();
  });
  it('should render correctly whith analysis', () => {
    const wrapper = shallow(
      <ProposalPageMainContent proposal={proposal} goToBlog={jest.fn()} isAnalysing />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with tipsmeeee', () => {
    enableFeatureFlags(['unstable__tipsmeee']);

    const wrapper = shallow(
      <ProposalPageMainContent
        proposal={{ ...proposal, tipsmeeeId: 'anId' }}
        goToBlog={jest.fn()}
        isAnalysing={false}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
