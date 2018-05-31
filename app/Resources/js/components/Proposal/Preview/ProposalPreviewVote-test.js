/* eslint-env jest */
// @flow
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalPreviewVote } from './ProposalPreviewVote';
import { $refType } from '../../../mocks';

describe('<ProposalPreviewVote />', () => {
  const props = {
    proposal: { $refType, id: '1' },
    step: { $refType },
    viewer: null,
  };

  it('should render a proposal preview vote', () => {
    // $FlowFixMe
    const wrapper = shallow(<ProposalPreviewVote {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
