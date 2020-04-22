// @flow
import React, { Component } from 'react';
import { Tabs, Tab, Badge } from 'react-bootstrap';
import { injectIntl, type IntlShape, FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import { connect } from 'react-redux';
import ProposalFormAdminConfigurationForm from './ProposalFormAdminConfigurationForm';
import ProposalFormAdminNotificationForm from './ProposalFormAdminNotificationForm';
import ProposalFormAdminEvaluationForm from './ProposalFormAdminEvaluationForm';
import ProposalFormAdminSettingsForm from './ProposalFormAdminSettingsForm';
import ProposalFormAdminAnalysisConfigurationForm from './ProposalFormAdminAnalysisConfigurationForm';
import type { ProposalFormAdminPageTabs_proposalForm } from '~relay/ProposalFormAdminPageTabs_proposalForm.graphql';
import type { ProposalFormAdminPageTabs_query } from '~relay/ProposalFormAdminPageTabs_query.graphql';
import type { GlobalState } from '~/types';

type DefaultProps = void;

type RelayProps = {|
  proposalForm: ProposalFormAdminPageTabs_proposalForm,
  query: ProposalFormAdminPageTabs_query,
|};
type Props = {|
  ...RelayProps,
  intl: IntlShape,
  analysisFeatureEnabled: boolean,
|};
type State = void;

export class ProposalFormAdminPageTabs extends Component<Props, State> {
  static defaultProps: DefaultProps;

  render() {
    const { intl, proposalForm, query, analysisFeatureEnabled } = this.props;
    return (
      <div>
        {proposalForm.url !== '' ? (
          <p>
            <strong>
              <FormattedMessage id="permalink" /> :
            </strong>{' '}
            <a href={proposalForm.url}>{proposalForm.url}</a> |{' '}
            <b>{intl.formatMessage({ id: 'global.ref' })} : </b> {proposalForm.reference}
          </p>
        ) : (
          <p>
            <strong>
              <FormattedMessage id="permalink-unavailable" />{' '}
            </strong>
            <FormattedMessage id="proposal-form-not-linked-to-a-project" /> |{' '}
            <b>{intl.formatMessage({ id: 'global.ref' })} : </b> {proposalForm.reference}
          </p>
        )}
        <Tabs defaultActiveKey="CONFIGURATION" id="proposal-form-admin-page-tabs">
          <Tab eventKey="CONFIGURATION" title={intl.formatMessage({ id: 'global.configuration' })}>
            <ProposalFormAdminConfigurationForm proposalForm={proposalForm} query={query} />
          </Tab>
          <Tab eventKey="LEGACY_ANALYSIS" title={intl.formatMessage({ id: 'proposal.tabs.evaluation' })}>
            <ProposalFormAdminEvaluationForm proposalForm={proposalForm} />
          </Tab>
          {analysisFeatureEnabled && !!proposalForm.step && (
            <Tab
              eventKey="NEW_ANALYSIS"
              title={
                <>
                  <FormattedMessage id="proposal.tabs.evaluation" />
                  <span className="ml-5">
                    <Badge pill variant="primary">
                      <FormattedMessage id="badge.new" />
                    </Badge>
                  </span>
                </>
              }>
              <ProposalFormAdminAnalysisConfigurationForm proposalForm={proposalForm} />
            </Tab>
          )}
          <Tab eventKey="NOTIFICATIONS" title={intl.formatMessage({ id: 'proposal_form.admin.notification' })}>
            <ProposalFormAdminNotificationForm proposalForm={proposalForm} />
          </Tab>
          <Tab eventKey="SETTINGS" title={intl.formatMessage({ id: 'global.params' })}>
            <ProposalFormAdminSettingsForm proposalForm={proposalForm} />
          </Tab>
        </Tabs>
      </div>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  analysisFeatureEnabled: state.default.features.unstable__analysis,
});

const withIntl = injectIntl(ProposalFormAdminPageTabs);
const container = connect(mapStateToProps)(withIntl);

export default createFragmentContainer(container, {
  proposalForm: graphql`
    fragment ProposalFormAdminPageTabs_proposalForm on ProposalForm {
      url
      reference
      step {
        id
      }
      ...ProposalFormAdminConfigurationForm_proposalForm
      ...ProposalFormAdminNotificationForm_proposalForm
      ...ProposalFormAdminSettingsForm_proposalForm
      ...ProposalFormAdminAnalysisConfigurationForm_proposalForm
      ...ProposalFormAdminEvaluationForm_proposalForm
    }
  `,
  query: graphql`
    fragment ProposalFormAdminPageTabs_query on Query {
      ...ProposalFormAdminConfigurationForm_query
    }
  `,
});
