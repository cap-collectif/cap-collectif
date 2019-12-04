// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import type { ProfileSourceList_sources } from '~relay/ProfileSourceList_sources.graphql';
import OpinionSource from '../Opinion/Source/OpinionSource';

type RelayProps = {|
  sources: ProfileSourceList_sources,
|};
type Props = {|
  ...RelayProps,
|};

class ProfileSourceList extends React.Component<Props> {
  render() {
    const { sources } = this.props;

    return (
      <div>
        {sources.edges &&
          sources.edges
            .filter(Boolean)
            .map(edge => edge.node)
            .filter(Boolean)
            .map(source => (
              // $FlowFixMe
              <OpinionSource key={source.id} source={source} sourceable={source.related} />
            ))}
      </div>
    );
  }
}

export default createFragmentContainer(ProfileSourceList, {
  sources: graphql`
    fragment ProfileSourceList_sources on SourceConnection
      @argumentDefinitions(isAuthenticated: { type: "Boolean!", defaultValue: false }) {
      edges {
        node {
          id
          ...OpinionSource_source @arguments(isAuthenticated: $isAuthenticated)
          related {
            ...OpinionSource_sourceable @arguments(isAuthenticated: $isAuthenticated)
          }
        }
      }
    }
  `,
});
