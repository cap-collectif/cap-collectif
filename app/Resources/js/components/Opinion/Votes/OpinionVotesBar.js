// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import OpinionUserVote from './OpinionUserVote';
import VotesBar from '../../Utils/VotesBar';
import OpinionVotesModal from './OpinionVotesModal';
import VersionVotesModal from '../VersionVotesModal';
import type { OpinionVotesBar_opinion } from '~relay/OpinionVotesBar_opinion.graphql';

type Props = {
  opinion: OpinionVotesBar_opinion,
};

class OpinionVotesBar extends React.Component<Props> {
  render() {
    const { opinion } = this.props;
    if (!opinion.section) return null;
    return (
      <div>
        {opinion.section.votesThreshold && opinion.section.votesThreshold > 0 && (
          <VotesBar
            max={opinion.section.votesThreshold}
            value={opinion.votesYes ? opinion.votesYes.totalCount : 0}
            helpText={opinion.section.votesThresholdHelpText}
          />
        )}
        <div style={{ paddingTop: '20px' }}>
          {opinion.previewVotes &&
            opinion.previewVotes.edges &&
            opinion.previewVotes.edges
              .filter(Boolean)
              .map(edge => edge.node)
              .filter(Boolean)
              .slice(0, 5)
              .map((vote, index) => (
                /* $FlowFixMe */
                <OpinionUserVote key={index} vote={vote} className="mr-0" />
              ))}
          {opinion.__typename === 'Opinion' && (
            /* $FlowFixMe */
            <OpinionVotesModal opinion={opinion} />
          )}
          {opinion.__typename === 'Version' && (
            /* $FlowFixMe */
            <VersionVotesModal version={opinion} />
          )}
        </div>
      </div>
    );
  }
}

export default createFragmentContainer(OpinionVotesBar, {
  opinion: graphql`
    fragment OpinionVotesBar_opinion on OpinionOrVersion {
      __typename
      ... on Opinion {
        ...OpinionVotesModal_opinion
        votesYes: votes(first: 0, value: YES) {
          totalCount
        }
        previewVotes: votes(first: 5) @connection(key: "OpinionVotesBar_previewVotes") {
          totalCount
          edges {
            node {
              ...OpinionUserVote_vote
            }
          }
        }
        section {
          votesThresholdHelpText
          votesThreshold
        }
      }
      ... on Version {
        ...VersionVotesModal_version
        votesYes: votes(first: 0, value: YES) {
          totalCount
        }
        previewVotes: votes(first: 5) @connection(key: "OpinionVotesBar_previewVotes") {
          totalCount
          edges {
            node {
              ...OpinionUserVote_vote
            }
          }
        }
        section {
          votesThreshold
          votesThresholdHelpText
        }
      }
    }
  `,
});
