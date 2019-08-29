// @flow
import React, { Component } from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import environment, { graphqlError } from '../../createRelayEnvironment';
import ProposalFormAdminPageTabs from './ProposalFormAdminPageTabs';
import Loader from '../Ui/FeedbacksIndicators/Loader';
import type { ProposalFormAdminPageQueryResponse } from '~relay/ProposalFormAdminPageQuery.graphql';
import type { Uuid } from '../../types';

export type Props = {| proposalFormId: Uuid |};

const component = ({
  error,
  props,
}: {
  props: ?ProposalFormAdminPageQueryResponse,
  ...ReactRelayReadyState,
}) => {
  if (error) {
    console.log(error); // eslint-disable-line no-console
    return graphqlError;
  }
  if (props) {
    if (props.proposalForm !== null) {
      // $FlowFixMe
      return <ProposalFormAdminPageTabs {...props} />;
    }
    return graphqlError;
  }
  return <Loader />;
};

export class ProposalFormAdminPage extends Component<Props> {
  render() {
    return (
      <div className="admin_proposal_form">
        <QueryRenderer
          environment={environment}
          query={graphql`
            query ProposalFormAdminPageQuery($id: ID!) {
              proposalForm: node(id: $id) {
                ...ProposalFormAdminPageTabs_proposalForm
              }
            }
          `}
          variables={{
            id: this.props.proposalFormId,
          }}
          render={component}
        />
      </div>
    );
  }
}

export default ProposalFormAdminPage;
