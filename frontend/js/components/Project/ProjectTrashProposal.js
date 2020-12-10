// @flow
import * as React from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import { connect } from 'react-redux';
import environment, { graphqlError } from '../../createRelayEnvironment';
import Loader from '../Ui/FeedbacksIndicators/Loader';
import ProposalTrashedListPaginated from '../Proposal/List/ProposalTrashedListPaginated';
import type {
  ProjectTrashProposalQueryResponse,
  ProjectTrashProposalQueryVariables,
} from '~relay/ProjectTrashProposalQuery.graphql';
import type { State } from '~/types';

export type Props = {|
  +projectId: string,
  +isAuthenticated: boolean,
  +isTipsMeeeEnabled: boolean,
|};

export const TRASHED_PROPOSAL_PAGINATOR_COUNT = 20;

export class ProjectTrashProposal extends React.Component<Props> {
  render() {
    const { projectId, isAuthenticated, isTipsMeeeEnabled } = this.props;
    return (
      <div className="container">
        <QueryRenderer
          environment={environment}
          query={graphql`
            query ProjectTrashProposalQuery(
              $projectId: ID!
              $stepId: ID!
              $isAuthenticated: Boolean!
              $isTipsMeeeEnabled: Boolean!
              $cursor: String
              $count: Int
            ) {
              project: node(id: $projectId) {
                ...ProposalTrashedListPaginated_project
                  @arguments(
                    count: $count
                    cursor: $cursor
                    isAuthenticated: $isAuthenticated
                    isTipsMeeeEnabled: $isTipsMeeeEnabled
                    stepId: $stepId
                  )
              }
            }
          `}
          variables={
            ({
              projectId,
              isAuthenticated,
              isTipsMeeeEnabled,
              count: TRASHED_PROPOSAL_PAGINATOR_COUNT,
              cursor: null,
              // TODO fixme https://github.com/cap-collectif/platform/issues/7016
              stepId: '',
            }: ProjectTrashProposalQueryVariables)
          }
          render={({
            error,
            props,
          }: {
            ...ReactRelayReadyState,
            props: ?ProjectTrashProposalQueryResponse,
          }) => {
            if (error) {
              return graphqlError;
            }

            if (!props) {
              return <Loader />;
            }

            const { project } = props;

            if (!project) {
              return graphqlError;
            }

            return <ProposalTrashedListPaginated project={project} />;
          }}
        />
      </div>
    );
  }
}
const mapStateToProps = (state: State) => ({
  isTipsMeeeEnabled: state.default.features.unstable__tipsmeee,
});

export default connect(mapStateToProps)(ProjectTrashProposal);
