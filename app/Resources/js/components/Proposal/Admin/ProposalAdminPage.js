// @flow
import React, { Component } from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import environment, { graphqlError } from '../../../createRelayEnvironment';
import ProposalAdminPageTabs from './ProposalAdminPageTabs';
import Loader from '../../Utils/Loader';
import { PROPOSAL_FOLLOWERS_TO_SHOW } from '../../../constants/ProposalConstants';

type DefaultProps = void;
type Props = { proposalId: number };
type State = void;

const component = ({ error, props }: { error: ?Error, props: any }) => {
  if (error) {
    console.log(error); // eslint-disable-line no-console
    return graphqlError;
  }
  if (props) {
    // eslint-disable-next-line
    if (props.proposal !== null) {
      return <ProposalAdminPageTabs {...props} />;
    }
    return graphqlError;
  }
  return <Loader />;
};

export class ProposalAdminPage extends Component<Props, State> {
  static defaultProps: DefaultProps;
  render() {
    return (
      <div className="admin_proposal_form">
        <QueryRenderer
          environment={environment}
          query={graphql`
            query ProposalAdminPageQuery($id: ID!, $count: Int!, $cursor: String) {
              proposal(id: $id) {
                ...ProposalAdminPageTabs_proposal
              }
            }
          `}
          variables={{
            id: this.props.proposalId,
            count: PROPOSAL_FOLLOWERS_TO_SHOW,
            cursor: null,
          }}
          render={component}
        />
      </div>
    );
  }
}

export default ProposalAdminPage;
