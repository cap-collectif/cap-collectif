// @flow
import React, { Component } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import { injectIntl, FormattedMessage, type IntlShape } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import ProposalAdminSelections from './ProposalAdminSelections';
import ProposalAdminStatusForm from './ProposalAdminStatusForm';
import ProposalAdminContentForm from './ProposalAdminContentForm';
import ProposalAdminNotationForm from './ProposalAdminNotationForm';
import ProposalAdminNewsForm from './ProposalAdminNewsForm';
import ProposalAdminFollowers from './ProposalAdminFollowers';
import type { ProposalAdminPageTabs_proposal } from './__generated__/ProposalAdminPageTabs_proposal.graphql';

type Props = { proposal: ProposalAdminPageTabs_proposal, intl: IntlShape };

export class ProposalAdminPageTabs extends Component<Props> {
  render() {
    const { intl, proposal } = this.props;

    return (
      <div>
        <p>
          <strong>
            <FormattedMessage id="permalink" /> :{' '}
          </strong>{' '}
          <a href={proposal.url}>{proposal.url}</a> |{' '}
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
            {/* $FlowFixMe https://github.com/cap-collectif/platform/issues/4973 */}
            <ProposalAdminNewsForm proposal={proposal} />
          </Tab>
          <Tab
            eventKey={4}
            title={
              <div>
                <FormattedMessage id="proposal.tabs.followers" />
                <span className="badge ml-10">
                  {proposal.allFollowers ? proposal.allFollowers.totalCount : 0}
                </span>
              </div>
            }>
            {/* $FlowFixMe https://github.com/cap-collectif/platform/issues/4973 */}
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
      url
      reference
      ...ProposalAdminStatusForm_proposal
      ...ProposalAdminSelections_proposal
      ...ProposalAdminContentForm_proposal
      ...ProposalAdminNotationForm_proposal
      ...ProposalAdminNewsForm_proposal
      ...ProposalAdminFollowers_proposal
      allFollowers: followers(first: 0) {
        totalCount
      }
    }
  `,
);
