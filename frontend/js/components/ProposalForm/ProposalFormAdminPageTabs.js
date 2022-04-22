// @flow
import React from 'react';
import { MemoryRouter, Route, Switch, NavLink } from 'react-router-dom';
import { injectIntl, type IntlShape, FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import ProposalFormAdminConfigurationForm from './ProposalFormAdminConfigurationForm';
import ProposalFormAdminNotificationForm from './ProposalFormAdminNotificationForm';
import ProposalFormAdminSettingsForm from './ProposalFormAdminSettingsForm';
import ProposalFormAdminAnalysisConfigurationForm from './ProposalFormAdminAnalysisConfigurationForm';
import type { ProposalFormAdminPageTabs_proposalForm } from '~relay/ProposalFormAdminPageTabs_proposalForm.graphql';
import type { ProposalFormAdminPageTabs_query } from '~relay/ProposalFormAdminPageTabs_query.graphql';
import ProposalFormAdminPageTabsContainer, {
  NavContainer,
  NavItem,
  ActionContainer,
} from '~/components/ProposalForm/ProposalFormAdminPageTabs.style';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';
import colors from '~/utils/colors';

const TABS = {
  CONFIGURATION: '/configuration',
  ANALYSIS: '/new_analysis',
  NOTIFICATIONS: '/notifications',
  SETTINGS: '/settings',
};

const setIntialIndex = (): number => {
  const openModal = window.location.hash.includes('#openAnalysisStep') ? 2 : 0;
  if (openModal > 0) {
    const newUrl = window.location.href.replace('#openAnalysisStep', '');
    window.history.pushState('', '', newUrl);
  }
  return openModal;
};

type RelayProps = {|
  proposalForm: ProposalFormAdminPageTabs_proposalForm,
  query: ProposalFormAdminPageTabs_query,
|};

type Props = {|
  ...RelayProps,
  intl: IntlShape,
|};

export const ProposalFormAdminPageTabs = ({ intl, proposalForm, query }: Props) => (
  <ProposalFormAdminPageTabsContainer id="proposal-form-admin-page">
    <MemoryRouter
      initialEntries={[...Object.values(TABS)].map(v => String(v))}
      initialIndex={setIntialIndex()}
      keyLength={Object.values(TABS).length}>
      <header>
        <div>
          <FormattedMessage
            id="page.title.form.name"
            tagName="h1"
            values={{ formName: proposalForm.title }}
          />

          <ActionContainer>
            <a href="/admin-next/proposalForm">
              <Icon name={ICON_NAME.list} size={13} color={colors.primaryColor} />
              <span className="ml-5">{intl.formatMessage({ id: 'link_action_list' })}</span>
            </a>
            {proposalForm.url && (
              <a href={proposalForm.url} target="_blank" rel="noopener noreferrer">
                <Icon name={ICON_NAME.externalLink} size={13} color={colors.primaryColor} />
                <span className="ml-5">{intl.formatMessage({ id: 'global.preview' })}</span>
              </a>
            )}
          </ActionContainer>
        </div>

        {!proposalForm.url && (
          <p className="mb-20">
            <FormattedMessage id="overview-unavailable" />
          </p>
        )}

        <NavContainer hasProposalFormUrl={!!proposalForm.url}>
          <NavItem>
            <NavLink to={TABS.CONFIGURATION} activeClassName="active" id="link-tab-configuration">
              {intl.formatMessage({ id: 'global.configuration' })}
            </NavLink>
          </NavItem>

          {proposalForm.step && (
            <NavItem>
              <NavLink to={TABS.ANALYSIS} activeClassName="active" id="link-tab-new-analysis">
                {intl.formatMessage({ id: 'proposal.tabs.evaluation' })}
              </NavLink>
            </NavItem>
          )}
          <NavItem>
            <NavLink to="/notifications" activeClassName="active" id="link-tab-notification">
              {intl.formatMessage({ id: 'proposal_form.admin.notification' })}
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink to="/SETTINGS" activeClassName="active" id="link-tab-settings">
              {intl.formatMessage({ id: 'global.params' })}
            </NavLink>
          </NavItem>
        </NavContainer>
      </header>

      <Switch>
        <Route path={TABS.CONFIGURATION}>
          <ProposalFormAdminConfigurationForm proposalForm={proposalForm} query={query} />
        </Route>

        {!!proposalForm.step && (
          <Route path={TABS.ANALYSIS}>
            <ProposalFormAdminAnalysisConfigurationForm proposalForm={proposalForm} />
          </Route>
        )}

        <Route path={TABS.NOTIFICATIONS}>
          <ProposalFormAdminNotificationForm proposalForm={proposalForm} query={query} />
        </Route>

        <Route path={TABS.SETTINGS}>
          <ProposalFormAdminSettingsForm proposalForm={proposalForm} />
        </Route>
      </Switch>
    </MemoryRouter>
  </ProposalFormAdminPageTabsContainer>
);

const withIntl = injectIntl(ProposalFormAdminPageTabs);

export default createFragmentContainer(withIntl, {
  proposalForm: graphql`
    fragment ProposalFormAdminPageTabs_proposalForm on ProposalForm {
      title
      url
      step {
        id
      }
      ...ProposalFormAdminConfigurationForm_proposalForm
      ...ProposalFormAdminNotificationForm_proposalForm
      ...ProposalFormAdminSettingsForm_proposalForm
      ...ProposalFormAdminAnalysisConfigurationForm_proposalForm
    }
  `,
  query: graphql`
    fragment ProposalFormAdminPageTabs_query on Query {
      ...ProposalFormAdminConfigurationForm_query
      ...ProposalFormAdminNotificationForm_query
    }
  `,
});
