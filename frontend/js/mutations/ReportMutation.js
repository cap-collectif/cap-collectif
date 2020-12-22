// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  ReportMutationVariables,
  ReportMutationResponse,
} from '~relay/ReportMutation.graphql';

const mutation = graphql`
  mutation ReportMutation($input: ReportInput!) {
    report(input: $input) {
      errorCode
      report {
        id
      }
    }
  }
`;

const commit = (variables: ReportMutationVariables): Promise<ReportMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
