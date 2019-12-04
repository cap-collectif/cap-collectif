/* eslint-env jest */
// @flow
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalPreviewVote } from './ProposalPreviewVote';
import { $refType, $fragmentRefs } from '../../../mocks';

describe('<ProposalPreviewVote />', () => {
  const props = {
    proposal: { $refType, $fragmentRefs, id: '1' },
    step: { $refType, $fragmentRefs },
    viewer: null,
  };

  it('should render a proposal preview vote', () => {
    const wrapper = shallow(<ProposalPreviewVote {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
