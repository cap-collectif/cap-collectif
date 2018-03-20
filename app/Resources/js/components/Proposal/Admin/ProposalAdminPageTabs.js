// @flow
import React, { Component } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import { injectIntl, FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import ProposalAdminSelections from './ProposalAdminSelections';
import ProposalAdminStatusForm from './ProposalAdminStatusForm';
import ProposalAdminContentForm from './ProposalAdminContentForm';
import ProposalAdminNotationForm from './ProposalAdminNotationForm';
import ProposalAdminNewsForm from './ProposalAdminNewsForm';
import ProposalAdminFollowers from './ProposalAdminFollowers';

type DefaultProps = void;
type Props = { proposal: any, intl: Object };
type State = void;

export class ProposalAdminPageTabs extends Component<Props, State> {
  static defaultProps: DefaultProps;
  render() {
    const { intl, proposal } = this.props;

    return (
      <div>
        <p>
          <strong>Permalien : </strong> <a href={proposal.show_url}>{proposal.show_url}</a> |{' '}
          <b>{intl.formatMessage({ id: 'proposal.admin.reference' })} :</b> {proposal.reference}
        </p>
        <Tabs defaultActiveKey={1} id="proposal-admin-page-tabs">
          <Tab eventKey={1} title={intl.formatMessage({ id: 'proposal.admin.content' })}>
            <ProposalAdminContentForm proposal={proposal} />
          </Tab>
          <Tab eventKey={2} title={intl.formatMessage({ id: 'proposal.admin.advancement' })}>
            <ProposalAdminSelections proposal={proposal} />
          </Tab>
          <Tab eventKey={3} title={intl.formatMessage({ id: 'proposal.admin.news' })}>
            <ProposalAdminNewsForm proposal={proposal} />
          </Tab>
          <Tab
            eventKey={4}
            title={
              <div>
                <FormattedMessage id="proposal.tabs.followers" />{' '}
                <span className="badge">{proposal.followerConnection.totalCount}</span>
              </div>
            }>
            <ProposalAdminFollowers proposal={proposal} />
          </Tab>
          <Tab eventKey={5} title={intl.formatMessage({ id: 'proposal.admin.notation' })}>
            <ProposalAdminNotationForm proposal={proposal} />
          </Tab>
          <Tab eventKey={6} title={intl.formatMessage({ id: 'proposal.admin.publication' })}>
            <ProposalAdminStatusForm proposal={proposal} />
          </Tab>
        </Tabs>
      </div>
    );
  }
}

const container = injectIntl(ProposalAdminPageTabs);

export default createFragmentContainer(
  container,
  graphql`
    fragment ProposalAdminPageTabs_proposal on Proposal {
      show_url
      reference
      ...ProposalAdminStatusForm_proposal
      ...ProposalAdminSelections_proposal
      ...ProposalAdminContentForm_proposal
      ...ProposalAdminNotationForm_proposal
      ...ProposalAdminNewsForm_proposal
      ...ProposalAdminFollowers_proposal
      followerConnection(first: $count, after: $cursor) {
        totalCount
      }
    }
  `,
);
