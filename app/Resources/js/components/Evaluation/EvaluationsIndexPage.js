// @flow
import * as React from 'react';
import { type ReadyState, QueryRenderer, graphql } from 'react-relay';
import ProposalFormEvaluationList, { pageSize } from './ProposalFormEvaluationList';
import environment, { graphqlError } from '../../createRelayEnvironment';
import Loader from '../Ui/FeedbacksIndicators/Loader';
import type { EvaluationsIndexPageQueryResponse } from '~relay/EvaluationsIndexPageQuery.graphql';

export const renderComponent = ({
  error,
  props,
}: { props: ?EvaluationsIndexPageQueryResponse } & ReadyState) => {
  if (error) {
    return graphqlError;
  }
  if (props) {
    // eslint-disable-next-line react/prop-types
    if (props.proposalForms && props.proposalForms.length) {
      return (
        <div>
          {// eslint-disable-next-line react/prop-types
          props.proposalForms.map(proposalForm => (
            // $FlowFixMe
            <ProposalFormEvaluationList key={proposalForm.id} proposalForm={proposalForm} />
          ))}
        </div>
      );
    }
    return graphqlError;
  }
  return <Loader />;
};

export class EvaluationsIndexPage extends React.Component<{}> {
  render() {
    return (
      <QueryRenderer
        variables={{
          count: pageSize,
          cursor: null,
        }}
        environment={environment}
        query={graphql`
          query EvaluationsIndexPageQuery($count: Int!, $cursor: String) {
            proposalForms {
              id
              ...ProposalFormEvaluationList_proposalForm @arguments(count: $count, cursor: $cursor)
            }
          }
        `}
        render={renderComponent}
      />
    );
  }
}

export default EvaluationsIndexPage;
