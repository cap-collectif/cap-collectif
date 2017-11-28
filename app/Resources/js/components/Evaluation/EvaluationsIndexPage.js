// @flow
import * as React from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import ProposalFormEvaluationList from './ProposalFormEvaluationList';
import environment, { graphqlError } from '../../createRelayEnvironment';
import Loader from '../Utils/Loader';
import type { EvaluationsIndexPageQueryResponse } from './__generated__/EvaluationsIndexPageQuery.graphql';

const render = ({ error, props }: { error: ?Error, props?: EvaluationsIndexPageQueryResponse }) => {
  if (error) {
    console.log(error); // eslint-disable-line no-console
    return graphqlError;
  }
  if (props) {
    // eslint-disable-next-line react/prop-types
    if (props.proposalForms && props.proposalForms.length) {
      return (
        <div>
          {// eslint-disable-next-line react/prop-types
          props.proposalForms.map(proposalForm => (
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
        environment={environment}
        query={graphql`
          query EvaluationsIndexPageQuery {
            proposalForms {
              id
              ...ProposalFormEvaluationList_proposalForm
            }
          }
        `}
        render={render}
      />
    );
  }
}

export default EvaluationsIndexPage;
