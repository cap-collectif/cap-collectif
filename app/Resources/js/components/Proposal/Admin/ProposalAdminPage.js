// @flow
import React, { Component } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import { injectIntl } from 'react-intl';
import { QueryRenderer, graphql } from 'react-relay';
import environment, { graphqlError } from '../../../createRelayEnvironment';
import ProposalAdminSelections from './ProposalAdminSelections';
import ProposalAdminStatusForm from './ProposalAdminStatusForm';
import ProposalAdminContentForm from './ProposalAdminContentForm';
import ProposalAdminNotationForm from './ProposalAdminNotationForm';
import ProposalAdminNewsForm from './ProposalAdminNewsForm';
import Loader from '../../Utils/Loader';

type DefaultProps = void;
type Props = { proposalId: number };
type State = void;

const renderProposalAdminPage = ({
  error,
  props,
  intl,
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
      return (
        <Tabs defaultActiveKey={2} id="proposal-admin-page-tabs">
          <Tab
            eventKey={1}
            title={intl.formatMessage({ id: 'proposal.admin.activity' })}
            disabled
          />
          <Tab
            eventKey={2}
            title={intl.formatMessage({ id: 'proposal.admin.content' })}>
            <ProposalAdminContentForm {...props} />
          </Tab>
          <Tab
            eventKey={3}
            title={intl.formatMessage({ id: 'proposal.admin.advancement' })}>
            <ProposalAdminSelections {...props} />
          </Tab>
          <Tab
            eventKey={4}
            title={intl.formatMessage({ id: 'proposal.admin.news' })}>
            <ProposalAdminNewsForm {...props} />
          </Tab>
          <Tab
            eventKey={5}
            title={intl.formatMessage({ id: 'proposal.admin.notation' })}>
            <ProposalAdminNotationForm {...props} />
          </Tab>
          <Tab
            eventKey={6}
            title={intl.formatMessage({ id: 'proposal.admin.publication' })}>
            <ProposalAdminStatusForm {...props} />
          </Tab>
        </Tabs>
      );
    }
    return graphqlError;
  }
  return <Loader />;
};

const render = injectIntl(renderProposalAdminPage);

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
          render={render}
        />
      </div>
    );
  }
}
