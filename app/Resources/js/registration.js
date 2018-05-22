// @flow
import moment from 'moment';
import ReactOnRails from 'react-on-rails';
import { addLocaleData } from 'react-intl';
import 'moment/locale/fr';
import frLocaleData from 'react-intl/locale-data/fr';
import 'moment/locale/en-gb';
import enLocaleData from 'react-intl/locale-data/en';
import 'moment/locale/es';
import esLocaleData from 'react-intl/locale-data/es';

import ProjectsListApp from './startup/ProjectsListAppClient';
import ProposalStepPageApp from './startup/ProposalStepPageApp';
import NavbarApp from './startup/NavbarAppClient';
import EmailNotConfirmedApp from './startup/EmailNotConfirmedAppClient';
import NewOpinionApp from './startup/NewOpinionAppClient';
import ProjectTrashButtonApp from './startup/ProjectTrashButtonApp';
import ProjectStepTabsApp from './startup/ProjectStepTabsApp';
import OpinionPageApp from './startup/OpinionPageApp';
import CommentSectionApp from './startup/CommentSectionApp';
import SynthesisViewBoxApp from './startup/SynthesisViewBoxApp';
import SynthesisEditBoxApp from './startup/SynthesisEditBoxApp';
import ProposalPageApp from './startup/ProposalPageApp';
import QuestionnaireStepPageApp from './startup/QuestionnaireStepPageApp';
import ProjectStatsPageApp from './startup/ProjectStatsPageApp';
import ProposalVoteBasketWidgetApp from './startup/ProposalVoteBasketWidgetApp';
import AlertBoxApp from './startup/AlertBoxApp';
import ConsultationPageApp from './startup/ConsultationPageApp';
import ProposalListApp from './startup/ProposalListApp';
import ProposalsUserVotesPageApp from './startup/ProposalsUserVotesPageApp';
import PhoneProfileApp from './startup/PhoneProfileApp';
import AccountProfileApp from './startup/AccountProfileApp';
import AccountProfileNotificationsApp from './startup/AccountProfileNotificationsApp';
import ShareButtonDropdownApp from './startup/ShareButtonDropdownApp';
import ProposalCreateFusionButtonApp from './startup/ProposalCreateFusionButtonApp';
import ProposalFormCreateButtonApp from './startup/ProposalFormCreateButtonApp';
import ProjectListPageApp from './startup/ProjectListPageApp';
import ProposalAdminPageApp from './startup/ProposalAdminPageApp';
import ProposalFormAdminPageApp from './startup/ProposalFormAdminPageApp';
import RegistrationAdminApp from './startup/RegistrationAdminApp';
import AdminModalsApp from './startup/AdminModalsApp';
import ShieldApp from './startup/ShieldApp';
import GroupAdminPageApp from './startup/GroupAdminPageApp';
import GroupCreateButtonApp from './startup/GroupCreateButtonApp';
import EvaluationsIndexPageApp from './startup/EvaluationsIndexPageApp';
import ChooseAUsernameApp from './startup/ChooseAUsernameApp';
import ParisUserNotValidApp from './startup/ParisUserNotValidApp';
import AccountProfileFollowingsApp from './startup/AccountProfileFollowingsApp';

import appStore from '../js/stores/AppStore';

const locale = window.locale;
if (locale === 'fr-FR') {
  addLocaleData(frLocaleData);
  moment.locale('fr-FR');
}
if (locale === 'en-GB') {
  addLocaleData(enLocaleData);
  moment.locale('en-GB');
}
if (locale === 'es-ES') {
  addLocaleData(esLocaleData);
  moment.locale('es-ES');
}

window.__SERVER__ = false;

ReactOnRails.registerStore({ appStore });

ReactOnRails.register({
  AccountProfileFollowingsApp,
  AccountProfileNotificationsApp,
  AdminModalsApp,
  RegistrationAdminApp,
  ChooseAUsernameApp,
  ParisUserNotValidApp,
  ShieldApp,
  ProjectListPageApp,
  ProposalFormCreateButtonApp,
  ProjectsListApp,
  ProposalAdminPageApp,
  ProposalCreateFusionButtonApp,
  ProposalStepPageApp,
  NavbarApp,
  EmailNotConfirmedApp,
  NewOpinionApp,
  AccountProfileApp,
  ProjectTrashButtonApp,
  ProjectStepTabsApp,
  EvaluationsIndexPageApp,
  OpinionPageApp,
  CommentSectionApp,
  SynthesisViewBoxApp,
  SynthesisEditBoxApp,
  ProposalPageApp,
  QuestionnaireStepPageApp,
  ProjectStatsPageApp,
  ProposalVoteBasketWidgetApp,
  AlertBoxApp,
  ConsultationPageApp,
  ProposalListApp,
  ProposalsUserVotesPageApp,
  PhoneProfileApp,
  ShareButtonDropdownApp,
  ProposalFormAdminPageApp,
  GroupAdminPageApp,
  GroupCreateButtonApp,
});
