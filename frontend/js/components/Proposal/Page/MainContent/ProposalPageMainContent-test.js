/* eslint-env jest */
// @flow
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalPageMainContent } from './ProposalPageMainContent';
import { $refType, $fragmentRefs } from '~/mocks';
import { features } from '~/redux/modules/default';

describe('<ProposalPageMainContent />', () => {
  const proposal = {
    $refType,
    $fragmentRefs,
    tipsmeeeId: null,
  };

  const propsFeatures = {
    ...features,
    unstable__tipsmeee: false,
  };
  const featuresWithTipsmeee = {
    ...features,
    unstable__tipsmeee: true,
  };

  it('should render correctly', () => {
    const wrapper = shallow(
      <ProposalPageMainContent
        proposal={proposal}
        features={propsFeatures}
        goToBlog={jest.fn()}
        isAnalysing={false}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });
  it('should render correctly whith analysis', () => {
    const wrapper = shallow(
      <ProposalPageMainContent
        proposal={proposal}
        features={propsFeatures}
        goToBlog={jest.fn()}
        isAnalysing
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with tipsmeeee', () => {
    const wrapper = shallow(
      <ProposalPageMainContent
        proposal={{ ...proposal, tipsmeeeId: 'anId' }}
        features={featuresWithTipsmeee}
        goToBlog={jest.fn()}
        isAnalysing={false}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
