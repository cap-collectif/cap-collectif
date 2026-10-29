import ReactOnRails from 'react-on-rails'
import AdminRightNavbarApp from '~/startup/AdminRightNavbarApp'
import ProposalFormAdminPageApp from '~/startup/ProposalFormAdminPageApp'
import QuestionnaireAdminPageApp from '~/startup/QuestionnaireAdminPageApp'
import UserAdminCreateButtonApp from '~/startup/UserAdminCreateButtonApp'
import ContactAdminPageApp from '~/startup/ContactAdminPageApp'
import RegistrationAdminApp from '~/startup/RegistrationAdminApp'
import ProposalAdminPageApp from '~/startup/ProposalAdminPageApp'
import UserAdminPageApp from '~/startup/UserAdminPageApp'
import LocaleAdminPageApp from '~/startup/LocaleAdminPageApp'
import ProjectAdminApp from '~/startup/ProjectAdminApp'
import EventAdminEditPageApp from '~/startup/EventAdminEditPageApp'
import FontAdminPageApp from '~/startup/FontAdminPageApp'
import appStore from '~/stores/AppStore'
import ProposalCreateFusionButtonApp from '~/startup/ProposalCreateFusionButtonApp'
import LanguageButtonApp from '~/startup/LanguageButtonApp'
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
  AdminRightNavbarApp,
  ProposalFormAdminPageApp,
  QuestionnaireAdminPageApp,
  UserAdminCreateButtonApp,
  ContactAdminPageApp,
  RegistrationAdminApp,
  ProposalAdminPageApp,
  UserAdminPageApp,
  ProposalCreateFusionButtonApp,
  LocaleAdminPageApp,
  ProjectAdminApp,
  EventAdminEditPageApp,
  FontAdminPageApp,
  LanguageButtonApp,
  HomePageProjectsSectionConfigurationApp,
  HomePageProjectsMapSectionConfigurationApp,
  EmailingParametersPageApp,
  SidebarApp,
})
