// @flow
import React, { Component } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import { QueryRenderer, graphql } from 'react-relay';
import environment, { graphqlError } from '../../../createRelayEnvironment';
import ProposalAdminSelections from './ProposalAdminSelections';
import ProposalAdminStatusForm from './ProposalAdminStatusForm';
import ProposalAdminContentForm from './ProposalAdminContentForm';
import ProposalAdminNotationForm from './ProposalAdminNotationForm';
import ProposalAdminNewsForm from './ProposalAdminNewsForm';
import Loader from '../../Utils/Loader';
// import type { ProposalAdminPageQueryResponse } from './__generated__/ProposalAdminPageQuery.graphql';

type DefaultProps = void;
type Props = { proposalId: number };
type State = void;

const renderProposalAdminPage = ({
  error,
  props,
}: {
  error: ?string,
  props: any, // ProposalAdminPageQueryResponse
}) => {
  if (error) {
    console.log(error); // eslint-disable-line no-console
    return graphqlError;
  }
  if (props) {
    // eslint-disable-next-line
    if (props.proposal) {
      return (
        <Tabs defaultActiveKey={2} id="proposal-admin-page-tabs">
          <Tab eventKey={1} title="Activité" disabled>
            Activité
          </Tab>
          <Tab eventKey={2} title="Contenu">
            <ProposalAdminContentForm {...props} />
          </Tab>
          <Tab eventKey={5} title="Avancement">
            <ProposalAdminSelections {...props} />
          </Tab>
          <Tab eventKey={3} title="Actualité">
            <ProposalAdminNewsForm {...props} />
          </Tab>
          <Tab eventKey={4} title="Evalutation">
            <ProposalAdminNotationForm {...props} />
          </Tab>
          <Tab eventKey={6} title="Publication">
            <ProposalAdminStatusForm {...props} />
          </Tab>
        </Tabs>
      );
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
              }
            }
          `}
          variables={{
            id: this.props.proposalId,
          }}
          render={renderProposalAdminPage}
        />
      </div>
    );
  }
}
