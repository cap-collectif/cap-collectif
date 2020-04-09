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
type Props = {|
  proposalForm: ProposalFormAdminPageTabs_proposalForm,
  query: ProposalFormAdminPageTabs_query,
  intl: IntlShape,
  analysisEnabled: boolean,
|};
type State = void;

export class ProposalFormAdminPageTabs extends Component<Props, State> {
  static defaultProps: DefaultProps;

  render() {
    const { intl, proposalForm, query, analysisEnabled } = this.props;
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
        <Tabs defaultActiveKey={1} id="proposal-form-admin-page-tabs">
          <Tab eventKey={1} title={intl.formatMessage({ id: 'global.configuration' })}>
            <ProposalFormAdminConfigurationForm proposalForm={proposalForm} query={query} />
          </Tab>
          <Tab eventKey={2} title={intl.formatMessage({ id: 'proposal.tabs.evaluation' })}>
            <ProposalFormAdminEvaluationForm proposalForm={proposalForm} />
          </Tab>
          {analysisEnabled && (
            <Tab eventKey={3} title={
              <>
                <FormattedMessage id="proposal.tabs.evaluation"/>
                <span className="ml-5">
                  <Badge pill variant="primary">
                    <FormattedMessage id="badge.new"/>
                  </Badge>
                </span>
              </>
            }>
              <ProposalFormAdminAnalysisConfigurationForm proposalForm={proposalForm} />
            </Tab>
          )}
          <Tab eventKey={4} title={intl.formatMessage({ id: 'proposal_form.admin.notification' })}>
            <ProposalFormAdminNotificationForm proposalForm={proposalForm} />
          </Tab>
          <Tab eventKey={5} title={intl.formatMessage({ id: 'global.params' })}>
            <ProposalFormAdminSettingsForm proposalForm={proposalForm} />
          </Tab>
        </Tabs>
      </div>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  analysisEnabled: state.default.features.unstable__analysis,
});

const withIntl = injectIntl(ProposalFormAdminPageTabs);
const container = connect(mapStateToProps)(withIntl);

export default createFragmentContainer(container, {
  proposalForm: graphql`
    fragment ProposalFormAdminPageTabs_proposalForm on ProposalForm {
      url
      reference
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
