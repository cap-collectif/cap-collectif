// @flow
import { graphql } from 'react-relay';
// eslint-disable-next-line import/no-unresolved
import type { RecordSourceSelectorProxy } from 'relay-runtime/store/RelayStoreTypes';
import { ConnectionHandler } from 'relay-runtime';
import type { ForOrAgainstValue } from '~relay/ArgumentCard_argument.graphql';
import environment from '~/createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  ReportDebateArgumentMutationVariables,
  ReportDebateArgumentMutationResponse,
} from '~relay/ReportDebateArgumentMutation.graphql';

type Variables = {|
  ...ReportDebateArgumentMutationVariables,
  debateId: string,
  forOrAgainst: ForOrAgainstValue,
  isMobile?: boolean,
|};

const mutation = graphql`
  mutation ReportDebateArgumentMutation($input: ReportInput!) {
    report(input: $input) {
      errorCode
      report {
        id
      }
    }
  }
`;

const commit = (variables: Variables): Promise<ReportDebateArgumentMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    updater: (store: RecordSourceSelectorProxy) => {
      const argumentId = variables.input.reportableId;
      const debate = store.get(variables.debateId);
      if (!debate) throw new Error("This debate doesn't exist");

      if (variables.isMobile) {
        const debateArguments = ConnectionHandler.getConnection(
          debate,
          'DebateStepPageAlternateArgumentsPagination_alternateArguments',
        );

        const edges = debateArguments?.getLinkedRecords('edges');
        if (!edges) throw new Error("This connection doesn't has edges");

        const nodeWithReportedArgument = edges
          ?.filter(Boolean)
          .map(edge => edge.getLinkedRecord('node'))
          .find(
            argument =>
              argument &&
              argument.getLinkedRecord(variables.forOrAgainst.toLowerCase())?.getValue('id') ===
                argumentId,
          );
        if (!nodeWithReportedArgument)
          throw new Error("Node with argument reported doesn't exist ");

        const reportedArgument = nodeWithReportedArgument.getLinkedRecord(
          variables.forOrAgainst.toLowerCase(),
        );
        if (!reportedArgument) throw new Error("DebateArgument with this id doesn't exist ");
        reportedArgument.setValue(false, 'viewerCanReport');
      } else {
        const debateArguments = ConnectionHandler.getConnection(
          debate,
          'DebateStepPageArgumentsPagination_arguments',
          { value: variables.forOrAgainst },
        );

        const edges = debateArguments?.getLinkedRecords('edges');
        if (!edges) throw new Error("This connection doesn't has edges");

        const debateArgumentReported = edges
          ?.filter(Boolean)
          .map(edge => edge.getLinkedRecord('node'))
          .find(argument => argument && argument.getValue('id') === argumentId);

        if (!debateArgumentReported) throw new Error("DebateArgument with this id doesn't exist ");
        debateArgumentReported.setValue(false, 'viewerCanReport');
      }
    },
  });

export default { commit };
