/* eslint-env jest */
// @flow
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalPageMainContent } from './ProposalPageMainContent';
import { $refType, $fragmentRefs } from '~/mocks';

describe('<ProposalPageMainContent />', () => {
  const proposal = {
    $refType,
    $fragmentRefs,
  };

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
});
