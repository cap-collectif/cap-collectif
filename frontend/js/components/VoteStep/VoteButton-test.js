// @flow
/* eslint-env jest */
import * as React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import VoteButton from './VoteButton';
import MockProviders from '~/testUtils';

describe('<VoteButton />', () => {
  const props = { proposalId: '<proposalId>', stepId: '<stepId', disabled: false };
  it('should render correctly when voted', () => {
    const testComponentTree = ReactTestRenderer.create(
      <MockProviders>
        <VoteButton {...props} hasVoted />
      </MockProviders>,
    );
    expect(testComponentTree).toMatchSnapshot();
  });

  it('should render correctly when not voted', () => {
    const testComponentTree = ReactTestRenderer.create(
      <MockProviders>
        <VoteButton {...props} hasVoted={false} />
      </MockProviders>,
    );
    expect(testComponentTree).toMatchSnapshot();
  });
});
