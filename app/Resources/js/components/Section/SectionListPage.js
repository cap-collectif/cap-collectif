// @flow
import React from 'react';
import { type ReadyState, QueryRenderer, graphql } from 'react-relay';
import environment, { graphqlError } from '../../createRelayEnvironment';
import { type SectionListPageQueryResponse } from '~relay/SectionListPageQuery.graphql';

import SectionList from './SectionList';
import Loader from '../Ui/FeedbacksIndicators/Loader';

const query = graphql`
  query SectionListPageQuery($userId: ID!) {
    sections(user: $userId) {
      id
      ...SectionList_sections
    }
  }
`;

export type Props = {|
  userId: string,
|};

export const rendering = ({
  error,
  props,
}: {
  error: ?Error,
  props?: ?SectionListPageQueryResponse,
} & ReadyState) => {
  if (error) {
    return graphqlError;
  }

  if (props && props.sections != null) {
    // $FlowFixMe
    return <SectionList sections={props.sections} />;
  }
  return <Loader />;
};

export default class SectionListPage extends React.Component<Props> {
  render() {
    return (
      <div>
        <QueryRenderer
          environment={environment}
          query={query}
          variables={{
            userId: this.props.userId,
          }}
          render={rendering}
        />
      </div>
    );
  }
}
