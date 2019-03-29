// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { Button } from 'react-bootstrap';
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
        <form style={{ display: 'inline-block' }}>
          {/* $FlowFixMe */}
          <OpinionSourceVoteButton
            source={source}
            disabled={!source.contribuable || source.author.isViewer}
          />
        </form>
        <Button className="btn--outline btn-dark-gray btn-xs opinion__votes-nb">
          {source.votes ? source.votes.totalCount : 0}
        </Button>
      </span>
    );
  }
}

export default createFragmentContainer(
  OpinionSourceVoteBox,
  graphql`
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
);
