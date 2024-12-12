import ReactOnRails from 'react-on-rails'
import AdminRightNavbarApp from '~/startup/AdminRightNavbarApp'
import ProjectCreateButtonApp from '~/startup/ProjectCreateButtonApp'
import SiteFaviconAdminPageApp from '~/startup/SiteFaviconAdminPageApp'
import ProposalFormAdminPageApp from '~/startup/ProposalFormAdminPageApp'
import QuestionnaireAdminPageApp from '~/startup/QuestionnaireAdminPageApp'
import GroupAdminPageApp from '~/startup/GroupAdminPageApp'
import GroupCreateButtonApp from '~/startup/GroupCreateButtonApp'
import UserAdminCreateButtonApp from '~/startup/UserAdminCreateButtonApp'
import ContactAdminPageApp from '~/startup/ContactAdminPageApp'
import RegistrationAdminApp from '~/startup/RegistrationAdminApp'
import ProposalAdminPageApp from '~/startup/ProposalAdminPageApp'
import UserAdminPageApp from '~/startup/UserAdminPageApp'
import MapAdminPageApp from '~/startup/MapAdminPageApp'
import LocaleAdminPageApp from '~/startup/LocaleAdminPageApp'
import ProjectAdminApp from '~/startup/ProjectAdminApp'
import ProjectAdminAppDeprecated from '~/startup/ProjectAdminAppDeprecated'
import GlobalDistrictAdminApp from '~/startup/GlobalDistrictAdminApp'
import EventAdminEditPageApp from '~/startup/EventAdminEditPageApp'
import ProjectExternalProjectAdminAppDeprecated from '~/startup/ProjectExternalProjectAdminAppDeprecated'
import FontAdminPageApp from '~/startup/FontAdminPageApp'
import appStore from '~/stores/AppStore'
import ProposalCreateFusionButtonApp from '~/startup/ProposalCreateFusionButtonApp'
import EventFormPageApp from './startup/EventFormPageApp'
import LanguageButtonApp from '~/startup/LanguageButtonApp'
import EmailingListPageApp from '~/startup/EmailingListPageApp'
import EmailingCampaignPageApp from '~/startup/EmailingCampaignPageApp'
import EmailingMailParameterPageApp from '~/startup/EmailingMailParameterPageApp'
import EmailingParametersPageApp from '~/startup/EmailingParametersPageApp'
import ToastsContainerApp from '~/startup/ToastsContainerApp'
import HomePageProjectsSectionConfigurationApp from '~/startup/HomePageProjectsSectionConfigurationApp'
import HomePageProjectsMapSectionConfigurationApp from '~/startup/HomePageProjectsMapSectionConfigurationApp'
import SidebarApp from '~/startup/SidebarApp'

ReactOnRails.registerStore({
  appStore,
})
ReactOnRails.register({
  ToastsContainerApp,
  SiteFaviconAdminPageApp,
  AdminRightNavbarApp,
  ProjectCreateButtonApp,
  ProposalFormAdminPageApp,
  QuestionnaireAdminPageApp,
  GroupAdminPageApp,
  GroupCreateButtonApp,
  UserAdminCreateButtonApp,
  ContactAdminPageApp,
  RegistrationAdminApp,
  ProposalAdminPageApp,
  UserAdminPageApp,
  EventFormPageApp,
  ProposalCreateFusionButtonApp,
  MapAdminPageApp,
  LocaleAdminPageApp,
  ProjectAdminApp,
  ProjectAdminAppDeprecated,
  GlobalDistrictAdminApp,
  EventAdminEditPageApp,
  ProjectExternalProjectAdminAppDeprecated,
  FontAdminPageApp,
  LanguageButtonApp,
  HomePageProjectsSectionConfigurationApp,
  HomePageProjectsMapSectionConfigurationApp,
  EmailingListPageApp,
  EmailingCampaignPageApp,
  EmailingMailParameterPageApp,
  EmailingParametersPageApp,
  SidebarApp,
})
