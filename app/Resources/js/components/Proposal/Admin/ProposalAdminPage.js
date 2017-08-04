// @flow
import React, { Component } from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import environment, { graphqlError } from '../../../createRelayEnvironment';
import ProposalAdminPageTabs from './ProposalAdminPageTabs';
import Loader from '../../Utils/Loader';

type DefaultProps = void;
type Props = { proposalId: number };
type State = void;

const component = ({
  error,
  props,
}: {
  error: ?string,
  intl: any,
  props: any,
}) => {
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

export default class ProposalAdminPage extends Component<
  DefaultProps,
  Props,
  State,
> {
  render() {
    return (
      <div className="container">
        <QueryRenderer
          environment={environment}
          query={graphql`
            query ProposalAdminPageQuery($id: ID!) {
              proposal(id: $id) {
                ...ProposalAdminStatusForm_proposal
                ...ProposalAdminSelections_proposal
                ...ProposalAdminContentForm_proposal
                ...ProposalAdminNotationForm_proposal
                ...ProposalAdminNewsForm_proposal
              }
            }
          `}
          variables={{
            id: this.props.proposalId,
          }}
          render={component}
        />
      </div>
    );
  }
}
