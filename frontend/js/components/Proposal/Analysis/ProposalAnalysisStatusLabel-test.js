// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalAnalysisStatusLabel } from './ProposalAnalysisStatusLabel';

describe('<ProposalAnalysisStatusLabel />', () => {
  it('renders correctly', () => {
    const props = {
      text: 'skusku',
      color: 'blue',
      fontSize: 12,
      iconSize: 14,
      iconName: 'close',
    };

    const wrapper = shallow(<ProposalAnalysisStatusLabel {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
