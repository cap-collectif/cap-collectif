// @flow
import moment from 'moment';
import ReactOnRails from 'react-on-rails';
// $FlowFixMe we don't cover synthesis with flow
import SynthesisViewBoxApp from '../js/startup/SynthesisViewBoxApp';
// $FlowFixMe we don't cover synthesis with flow
import SynthesisEditBoxApp from '../js/startup/SynthesisEditBoxApp';

import ProjectsListApp from '../js/startup/ProjectsListAppClient';
import ProposalStepPageApp from '../js/startup/ProposalStepPageApp';
import NavbarApp from '../js/startup/NavbarAppClient';
import EmailNotConfirmedApp from '../js/startup/EmailNotConfirmedAppClient';
import AccountProfileApp from '../js/startup/AccountProfileApp';
import ProjectTrashButtonApp from '../js/startup/ProjectTrashButtonApp';
import OpinionPageApp from '../js/startup/OpinionPageApp';
import CommentSectionApp from '../js/startup/CommentSectionApp';
import ProposalPageApp from '../js/startup/ProposalPageApp';
import QuestionnaireStepPageApp from '../js/startup/QuestionnaireStepPageApp';
import ProjectStatsPageApp from '../js/startup/ProjectStatsPageApp';
import ProposalVoteBasketWidgetApp from '../js/startup/ProposalVoteBasketWidgetApp';
import AlertBoxApp from '../js/startup/AlertBoxApp';
import ConsultationPageApp from '../js/startup/ConsultationPageApp';
import UserProposalsApp from '../js/startup/UserProposalsApp';
import ProposalsUserVotesPageApp from '../js/startup/ProposalsUserVotesPageApp';
import ShareButtonDropdownApp from '../js/startup/ShareButtonDropdownApp';
import ProposalCreateFusionButtonApp from '../js/startup/ProposalCreateFusionButtonApp';
import ProposalFormCreateButtonApp from '../js/startup/ProposalFormCreateButtonApp';
import ProjectListPageApp from '../js/startup/ProjectListPageApp';
import ProposalAdminPageApp from '../js/startup/ProposalAdminPageApp';
import ProposalFormAdminPageApp from '../js/startup/ProposalFormAdminPageApp';
import QuestionnaireAdminPageApp from '../js/startup/QuestionnaireAdminPageApp';
import QuestionnaireCreateButtonApp from '../js/startup/QuestionnaireCreateButtonApp';
import ShieldApp from '../js/startup/ShieldApp';
import RegistrationAdminApp from '../js/startup/RegistrationAdminApp';
import GroupAdminPageApp from '../js/startup/GroupAdminPageApp';
import EvaluationsIndexPageApp from '../js/startup/EvaluationsIndexPageApp';
import ChooseAUsernameApp from '../js/startup/ChooseAUsernameApp';
import appStore from '../js/stores/AppStore';
import AccountProfileFollowingsApp from '../js/startup/AccountProfileFollowingsApp';
import UserAdminCreateButtonApp from '../js/startup/UserAdminCreateButtonApp';
import ParisUserNotValidApp from '../js/startup/ParisUserNotValidApp';
import EditProfileApp from '../js/startup/EditProfileApp';
import PrivacyApp from '../js/startup/PrivacyApp';
import CookieApp from '../js/startup/CookieApp';
import CookieManagerApp from '../js/startup/CookieManagerApp';
import CookieContentApp from '../js/startup/CookieContentApp';
import UserAdminPageApp from '../js/startup/UserAdminPageApp';
import ProjectRestrictedAccessAlertApp from '../js/startup/ProjectRestrictedAccessAlertApp';
import ProjectRestrictedAccessApp from '../js/startup/ProjectRestrictedAccessApp';
import ArgumentListApp from '../js/startup/ArgumentListApp';
import VoteListApp from '../js/startup/VoteListApp';
import EventApp from '../js/startup/EventApp';
import ProjectDistrictAdminApp from '../js/startup/ProjectDistrictAdminApp';
import ProjectTrashCommentApp from '../js/startup/ProjectTrashCommentApp';
import AdminExportButtonApp from '../js/startup/AdminExportButtonApp';
import EventListApp from '../js/startup/EventListApp';
import SectionPageApp from '../js/startup/SectionPageApp';
import AuthentificationAdminApp from '../js/startup/AuthentificationAdminApp';
import ProfileUserCommentApp from "../js/startup/ProfileUserCommentApp";
import EventAdminCreatePageApp from '../js/startup/EventAdminCreatePageApp';
import EventAdminEditPageApp from '../js/startup/EventAdminEditPageApp';
import EventFormPageApp from '../js/startup/EventFormPageApp';

const emptyFunction = () => {};

global.clearTimeout = global.clearTimeout || emptyFunction;
global.setTimeout = global.setTimeout || emptyFunction;
global.setInterval = global.setInterval || emptyFunction;
global.locale = global.locale || 'fr-FR';

moment.locale(global.locale);

ReactOnRails.registerStore({ appStore });
ReactOnRails.register({
  AccountProfileFollowingsApp,
  RegistrationAdminApp,
  ShieldApp,
  ChooseAUsernameApp,
  SectionPageApp,
  ProposalFormCreateButtonApp,
  ProjectListPageApp,
  ProposalCreateFusionButtonApp,
  ProposalAdminPageApp,
  ProjectsListApp,
  EvaluationsIndexPageApp,
  ProposalStepPageApp,
  NavbarApp,
  EmailNotConfirmedApp,
  ProjectTrashButtonApp,
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
  AccountProfileApp,
  ShareButtonDropdownApp,
  ProposalFormAdminPageApp,
  QuestionnaireAdminPageApp,
  GroupAdminPageApp,
  UserAdminCreateButtonApp,
  ParisUserNotValidApp,
  EditProfileApp,
  CookieManagerApp,
  PrivacyApp,
  CookieApp,
  CookieContentApp,
  UserAdminPageApp,
  ProjectRestrictedAccessAlertApp,
  ProjectRestrictedAccessApp,
  QuestionnaireCreateButtonApp,
  ArgumentListApp,
  VoteListApp,
  EventApp,
  ProjectDistrictAdminApp,
  ProjectTrashCommentApp,
  AdminExportButtonApp,
  EventListApp,
  AuthentificationAdminApp,
  ProfileUserCommentApp,
  EventAdminCreatePageApp,
  EventAdminEditPageApp,
  EventFormPageApp,
});
