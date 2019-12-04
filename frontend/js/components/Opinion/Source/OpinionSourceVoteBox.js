// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import OpinionSourceVoteButton from './OpinionSourceVoteButton';
import type { OpinionSourceVoteBox_source } from '~relay/OpinionSourceVoteBox_source.graphql';

type Props = {
  source: OpinionSourceVoteBox_source,
};

class OpinionSourceVoteBox extends React.Component<Props> {
  render() {
    const { source } = this.props;
    return (
      <span>
        <form className="opinion__votes-button">
          {/* $FlowFixMe */}
          <OpinionSourceVoteButton
            source={source}
            disabled={!source.contribuable || source.author.isViewer}
          />
        </form>
        <span className="opinion__votes-nb">{source.votes ? source.votes.totalCount : 0}</span>
      </span>
    );
  }
}

export default createFragmentContainer(OpinionSourceVoteBox, {
  source: graphql`
    fragment OpinionSourceVoteBox_source on Source
      @argumentDefinitions(isAuthenticated: { type: "Boolean!", defaultValue: true }) {
      id
      author {
        id
        slug
        isViewer @include(if: $isAuthenticated)
      }
      contribuable
      votes(first: 0) {
        totalCount
      }
      ...OpinionSourceVoteButton_source @arguments(isAuthenticated: $isAuthenticated)
    }
  `,
});
