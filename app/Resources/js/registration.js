// @flow
import moment from 'moment-timezone';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactOnRails from 'react-on-rails';
import { addLocaleData } from 'react-intl';
import 'moment/locale/fr';
import frLocaleData from 'react-intl/locale-data/fr';
import 'moment/locale/nl';
import nlLocaleData from 'react-intl/locale-data/nl';
import 'moment/locale/en-gb';
import enLocaleData from 'react-intl/locale-data/en';
import 'moment/locale/es';
import esLocaleData from 'react-intl/locale-data/es';
import 'moment/locale/de';
import deLocaleData from 'react-intl/locale-data/de';
// $FlowFixMe Polyfill
import 'url-search-params-polyfill';

import ProjectsListApp from './startup/ProjectsListAppClient';
import ProposalStepPageApp from './startup/ProposalStepPageApp';
import NavbarApp from './startup/NavbarAppClient';
import EmailNotConfirmedApp from './startup/EmailNotConfirmedAppClient';
import ProjectTrashButtonApp from './startup/ProjectTrashButtonApp';
import ProjectStepTabsApp from './startup/ProjectStepTabsApp';
import CarouselApp from './startup/CarouselApp';
import MetricsApp from './startup/MetricsApp';
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
import UserProposalsApp from './startup/UserProposalsApp';
import ProposalsUserVotesPageApp from './startup/ProposalsUserVotesPageApp';
import AccountProfileApp from './startup/AccountProfileApp';
import ShareButtonDropdownApp from './startup/ShareButtonDropdownApp';
import ProjectHeaderDistrictsApp from './startup/ProjectHeaderDistrictsApp';
import ProjectHeaderAuthorsApp from './startup/ProjectHeaderAuthorsApp';
import ProposalCreateFusionButtonApp from './startup/ProposalCreateFusionButtonApp';
import ProposalFormCreateButtonApp from './startup/ProposalFormCreateButtonApp';
import SectionListPageApp from './startup/SectionListPageApp';
import ProjectListPageApp from './startup/ProjectListPageApp';
import ProposalAdminPageApp from './startup/ProposalAdminPageApp';
import ProposalFormAdminPageApp from './startup/ProposalFormAdminPageApp';
import QuestionnaireAdminPageApp from './startup/QuestionnaireAdminPageApp';
import RegistrationAdminApp from './startup/RegistrationAdminApp';
import ShieldApp from './startup/ShieldApp';
import GroupAdminPageApp from './startup/GroupAdminPageApp';
import GroupCreateButtonApp from './startup/GroupCreateButtonApp';
import EvaluationsIndexPageApp from './startup/EvaluationsIndexPageApp';
import ChooseAUsernameApp from './startup/ChooseAUsernameApp';
import ParisUserNotValidApp from './startup/ParisUserNotValidApp';
import AccountProfileFollowingsApp from './startup/AccountProfileFollowingsApp';
import UserAdminCreateButtonApp from './startup/UserAdminCreateButtonApp';
import ProjectCreateButtonApp from './startup/ProjectCreateButtonApp';
import EditProfileApp from './startup/EditProfileApp';
import CookieContentApp from './startup/CookieContentApp';
import CookieManagerApp from './startup/CookieManagerApp';
import PrivacyApp from './startup/PrivacyApp';
import CookieApp from './startup/CookieApp';
import UserAdminPageApp from './startup/UserAdminPageApp';
import ProjectRestrictedAccessAlertApp from './startup/ProjectRestrictedAccessAlertApp';
import ProjectRestrictedAccessApp from './startup/ProjectRestrictedAccessApp';
import QuestionnaireCreateButtonApp from './startup/QuestionnaireCreateButtonApp';
import ArgumentListApp from './startup/ArgumentListApp';
import VoteListApp from './startup/VoteListApp';
import EventApp from './startup/EventApp';
import ProjectDistrictAdminApp from './startup/ProjectDistrictAdminApp';
import ProjectAdminApp from './startup/ProjectAdminApp';
import SiteFaviconAdminPageApp from './startup/SiteFaviconAdminPageApp';
import ContactAdminPageApp from './startup/ContactAdminPageApp';
import ProjectTrashCommentApp from './startup/ProjectTrashCommentApp';
import ProjectTrashProposalApp from './startup/ProjectTrashProposalApp';
import AdminImportEventsApp from './startup/AdminImportEventsApp';
import AdminExportButtonApp from './startup/AdminExportButtonApp';
import EventListApp from './startup/EventListApp';
import ContactsListPage from './startup/ContactsListPage';
import ContactPage from './startup/ContactPage';
import SectionPageApp from './startup/SectionPageApp';
import MapAdminPageApp from './startup/MapAdminPageApp';
import SSOSwitchUserApp from './startup/SSOSwitchUserApp';
import LastProposalsApp from './startup/LastProposalsApp';
import AuthentificationAdminApp from './startup/AuthentificationAdminApp';
import HomePageEventsApp from './startup/HomePageEventsApp';
import PresentationStepEventsApp from './startup/PresentationStepEventsApp';
import appStore from './stores/AppStore';

if (process.env.NODE_ENV === 'development') {
  if (new URLSearchParams(window.location.search).get('axe')) {
    global.axe(React, ReactDOM, 1000);
  }
}

// Use window.locale to set the current locale data
const { locale, timeZone } = window;
moment.tz.setDefault(timeZone);

if (locale) {
  let localeData = frLocaleData;
  switch (locale) {
    case 'fr-FR':
      localeData = frLocaleData;
      break;
    case 'en-GB':
      localeData = enLocaleData;
      break;
    case 'es-ES':
      localeData = esLocaleData;
      break;
    case 'de-DE':
      localeData = deLocaleData;
      break;
    case 'nl-NL':
      localeData = nlLocaleData;
      break;
    default:
      break;
  }
  addLocaleData(localeData);
  moment.locale(locale);
}

window.__SERVER__ = false;

ReactOnRails.registerStore({ appStore });

ReactOnRails.register({
  LastProposalsApp,
  AccountProfileFollowingsApp,
  ContactsListPage,
  ContactPage,
  ContactAdminPageApp,
  RegistrationAdminApp,
  ChooseAUsernameApp,
  ParisUserNotValidApp,
  ShieldApp,
  HomePageEventsApp,
  PresentationStepEventsApp,
  ProjectListPageApp,
  ProposalFormCreateButtonApp,
  ProjectsListApp,
  ProposalAdminPageApp,
  ProposalCreateFusionButtonApp,
  ProposalStepPageApp,
  NavbarApp,
  EmailNotConfirmedApp,
  AdminImportEventsApp,
  SectionPageApp,
  AccountProfileApp,
  ProjectTrashButtonApp,
  ProjectStepTabsApp,
  CarouselApp,
  MetricsApp,
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
  UserProposalsApp,
  ProposalsUserVotesPageApp,
  ShareButtonDropdownApp,
  ProjectHeaderAuthorsApp,
  ProjectHeaderDistrictsApp,
  SiteFaviconAdminPageApp,
  ProposalFormAdminPageApp,
  QuestionnaireAdminPageApp,
  QuestionnaireCreateButtonApp,
  GroupAdminPageApp,
  GroupCreateButtonApp,
  UserAdminCreateButtonApp,
  EditProfileApp,
  CookieManagerApp,
  PrivacyApp,
  CookieApp,
  CookieContentApp,
  UserAdminPageApp,
  MapAdminPageApp,
  ProjectRestrictedAccessAlertApp,
  ProjectRestrictedAccessApp,
  ArgumentListApp,
  VoteListApp,
  EventApp,
  ProjectAdminApp,
  ProjectDistrictAdminApp,
  ProjectTrashCommentApp,
  ProjectTrashProposalApp,
  AdminExportButtonApp,
  EventListApp,
  SSOSwitchUserApp,
  AuthentificationAdminApp,
  ProjectCreateButtonApp,
  SectionListPageApp,
});
