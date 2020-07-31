// @flow
import ReactOnRails from 'react-on-rails';

import AdminRightNavbarApp from '~/startup/AdminRightNavbarApp';
import ProjectCreateButtonApp from '~/startup/ProjectCreateButtonApp';
import ProposalFormCreateButtonApp from '~/startup/ProposalFormCreateButtonApp';
import QuestionnaireCreateButtonApp from '~/startup/QuestionnaireCreateButtonApp';
import SiteFaviconAdminPageApp from '~/startup/SiteFaviconAdminPageApp';
import ProposalFormAdminPageApp from '~/startup/ProposalFormAdminPageApp';
import QuestionnaireAdminPageApp from '~/startup/QuestionnaireAdminPageApp';
import GroupAdminPageApp from '~/startup/GroupAdminPageApp';
import GroupCreateButtonApp from '~/startup/GroupCreateButtonApp';
import UserAdminCreateButtonApp from '~/startup/UserAdminCreateButtonApp';
import ContactAdminPageApp from '~/startup/ContactAdminPageApp';
import RegistrationAdminApp from '~/startup/RegistrationAdminApp';
import ProposalAdminPageApp from '~/startup/ProposalAdminPageApp';
import AdminImportEventsApp from '~/startup/AdminImportEventsApp';
import UserAdminPageApp from '~/startup/UserAdminPageApp';
import MapAdminPageApp from '~/startup/MapAdminPageApp';
import LocaleAdminPageApp from '~/startup/LocaleAdminPageApp';
import ProjectAdminApp from '~/startup/ProjectAdminApp';
import ProjectAdminAppDeprecated from '~/startup/ProjectAdminAppDeprecated';
import ProjectDistrictAdminApp from '~/startup/ProjectDistrictAdminApp';
import AdminExportButtonApp from '~/startup/AdminExportButtonApp';
import AuthentificationAdminApp from '~/startup/AuthentificationAdminApp';
import EventAdminEditPageApp from '~/startup/EventAdminEditPageApp';
import ProjectExternalProjectAdminAppDeprecated from '~/startup/ProjectExternalProjectAdminAppDeprecated';
import FontAdminPageApp from '~/startup/FontAdminPageApp';
import RedirectIoAdminPageApp from '~/startup/RedirectIoAdminPageApp';
import appStore from '~/stores/AppStore';
import AlertBoxApp from '~/startup/AlertBoxApp';
import ProposalCreateFusionButtonApp from '~/startup/ProposalCreateFusionButtonApp';
import EventFormPageApp from './startup/EventFormPageApp';
import LanguageButtonApp from '~/startup/LanguageButtonApp';
import UserInviteAdminPageApp from '~/startup/UserInviteAdminPageApp';

ReactOnRails.registerStore({ appStore });

ReactOnRails.register({
  AlertBoxApp,
  AdminRightNavbarApp,
  ProjectCreateButtonApp,
  ProposalFormCreateButtonApp,
  QuestionnaireCreateButtonApp,
  SiteFaviconAdminPageApp,
  ProposalFormAdminPageApp,
  QuestionnaireAdminPageApp,
  GroupAdminPageApp,
  GroupCreateButtonApp,
  UserAdminCreateButtonApp,
  ContactAdminPageApp,
  RegistrationAdminApp,
  ProposalAdminPageApp,
  AdminImportEventsApp,
  UserAdminPageApp,
  EventFormPageApp,
  ProposalCreateFusionButtonApp,
  MapAdminPageApp,
  LocaleAdminPageApp,
  ProjectAdminApp,
  ProjectAdminAppDeprecated,
  ProjectDistrictAdminApp,
  AdminExportButtonApp,
  AuthentificationAdminApp,
  EventAdminEditPageApp,
  ProjectExternalProjectAdminAppDeprecated,
  FontAdminPageApp,
  RedirectIoAdminPageApp,
  LanguageButtonApp,
  UserInviteAdminPageApp,
});
