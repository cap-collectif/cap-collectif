// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import ArgumentVoteButton from './ArgumentVoteButton';
import type { ArgumentVoteBox_argument } from './__generated__/ArgumentVoteBox_argument.graphql';

type Props = {
  argument: ArgumentVoteBox_argument,
};

export class ArgumentVoteBox extends React.Component<Props> {
  render() {
    const { argument } = this.props;
    return (
      <span>
        <form style={{ display: 'inline-block' }}>
          {/* $FlowFixMe */}
          <ArgumentVoteButton argument={argument} />
        </form>{' '}
        <span className="opinion__votes-nb">{argument.votes.totalCount}</span>
      </span>
    );
  }
}

export default createFragmentContainer(
  ArgumentVoteBox,
  graphql`
    fragment ArgumentVoteBox_argument on Argument
      @argumentDefinitions(isAuthenticated: { type: "Boolean!", defaultValue: true }) {
      votes(first: 0) {
        totalCount
      }
      ...ArgumentVoteButton_argument @arguments(isAuthenticated: $isAuthenticated)
    }
  `,
);
