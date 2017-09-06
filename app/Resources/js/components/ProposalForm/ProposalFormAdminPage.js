// @flow
import React, { Component } from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import environment, { graphqlError } from '../../createRelayEnvironment';
import ProposalFormAdminPageTabs from './ProposalFormAdminPageTabs';
import Loader from '../Utils/Loader';
import type { ProposalFormAdminPageQueryResponse } from './__generated__/ProposalFormAdminPageQuery.graphql';

type DefaultProps = void;
type Props = { proposalFormId: number };
type State = void;

const component = ({
  error,
  props,
}: {
  error: ?Error,
  props: ProposalFormAdminPageQueryResponse,
}) => {
  if (error) {
    console.log(error); // eslint-disable-line no-console
    return graphqlError;
  }
  if (props) {
    // eslint-disable-next-line
    if (props.proposalForm !== null) {
      return <ProposalFormAdminPageTabs {...props} />;
    }
    return graphqlError;
  }
  return <Loader />;
};

export class ProposalFormAdminPage extends Component<Props, State> {
  static defaultProps: DefaultProps;
  render() {
    return (
      <div className="container">
        <QueryRenderer
          environment={environment}
          query={graphql`
            query ProposalFormAdminPageQuery($id: Int!) {
              proposalForm(id: $id) {
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
