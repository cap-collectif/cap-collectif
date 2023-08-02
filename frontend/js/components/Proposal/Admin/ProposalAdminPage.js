// @flow
import * as React from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import { connect } from 'react-redux';
import { isDirty } from 'redux-form';
import environment, { graphqlError } from '../../../createRelayEnvironment';
import ProposalAdminPageTabs from './ProposalAdminPageTabs';
import { PROPOSAL_FOLLOWERS_TO_SHOW } from '../../../constants/ProposalConstants';
import Loader from '../../Ui/FeedbacksIndicators/Loader';
import type { State } from '../../../types';

export type Props = {|
  proposalId: number,
  dirty: boolean,
  proposalRevisionsEnabled: boolean,
  viewerIsAdmin: boolean,
|};

const onUnload = e => {
  // $FlowFixMe voir https://github.com/facebook/flow/issues/3690
  e.returnValue = true;
};

const component = ({ error, props }: { error: ?Error, props: any }) => {
  if (error) {
    console.log(error); // eslint-disable-line no-console
    return graphqlError;
  }
  if (props) {
    if (props.proposal !== null) {
      return <ProposalAdminPageTabs {...props} />;
    }
    return graphqlError;
  }
  return <Loader />;
};

export const ProposalAdminPage = ({
  proposalId,
  proposalRevisionsEnabled,
  viewerIsAdmin,
  dirty,
}: Props) => {
  React.useEffect(() => {
    if (dirty) window.addEventListener('beforeunload', onUnload);
    else window.removeEventListener('beforeunload', onUnload);

    return () => window.removeEventListener('beforeunload', onUnload);
  }, [dirty]);

  return (
    <div className="admin_proposal_form">
      <QueryRenderer
        environment={environment}
        query={graphql`
          query ProposalAdminPageQuery(
            $id: ID!
            $count: Int!
            $proposalRevisionsEnabled: Boolean!
            $viewerIsAdmin: Boolean!
            $cursor: String
          ) {
            viewer {
              ...ProposalAdminPageTabs_viewer
            }
            proposal: node(id: $id) {
              ...ProposalAdminPageTabs_proposal
                @arguments(
                  proposalRevisionsEnabled: $proposalRevisionsEnabled
                  viewerIsAdmin: $viewerIsAdmin
                )
            }
          }
        `}
        variables={{
          id: proposalId,
          count: PROPOSAL_FOLLOWERS_TO_SHOW,
          proposalRevisionsEnabled,
          viewerIsAdmin,
          cursor: null,
        }}
        render={component}
      />
    </div>
  );
};

const mapStateToProps = (state: State, props: Props) => {
  return {
    proposalRevisionsEnabled: state.default.features.proposal_revisions ?? false,
    viewerIsAdmin: props.viewerIsAdmin,
    dirty:
      isDirty('proposal-admin-edit')(state) ||
      isDirty('proposal-admin-selections')(state) ||
      isDirty('proposal-admin-evaluation')(state) ||
      isDirty('proposal-admin-status')(state),
  };
};
export default connect<any, any, _, _, _, _>(mapStateToProps)(ProposalAdminPage);
