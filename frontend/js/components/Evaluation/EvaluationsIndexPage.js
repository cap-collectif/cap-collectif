// @flow
import * as React from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import ProposalFormEvaluationList, { pageSize } from './ProposalFormEvaluationList';
import environment, { graphqlError } from '../../createRelayEnvironment';
import Loader from '../Ui/FeedbacksIndicators/Loader';
import type { EvaluationsIndexPageQueryResponse } from '~relay/EvaluationsIndexPageQuery.graphql';

export const renderComponent = ({
  error,
  props,
}: {
  ...ReactRelayReadyState,
  props: ?EvaluationsIndexPageQueryResponse,
}) => {
  if (error) {
    return graphqlError;
  }
  if (props) {
    if (props.proposalForms && props.proposalForms.length) {
      return (
        <div>
          {props.proposalForms.filter(Boolean).map(proposalForm => (
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
