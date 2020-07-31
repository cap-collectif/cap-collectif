// @flow
import ReactOnRails from 'react-on-rails';

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
// $FlowFixMe we don't cover Synthesis
import SynthesisViewBoxApp from './startup/SynthesisViewBoxApp';
// $FlowFixMe we don't cover Synthesis
import SynthesisEditBoxApp from './startup/SynthesisEditBoxApp';
import ProposalPageApp from './startup/ProposalPageApp';
import QuestionnaireStepPageApp from './startup/QuestionnaireStepPageApp';
import ProjectStatsPageApp from './startup/ProjectStatsPageApp';
import ProposalVoteBasketWidgetApp from './startup/ProposalVoteBasketWidgetApp';
import AlertBoxApp from './startup/AlertBoxApp';
import ConsultationPageApp from './startup/ConsultationPageApp';
import MetaStepNavigationApp from './startup/MetaStepNavigationApp';
import UserProposalsApp from './startup/UserProposalsApp';
import SourcePageApp from './startup/SourcePageApp';
import ProposalsUserVotesPageApp from './startup/ProposalsUserVotesPageApp';
import AccountProfileApp from './startup/AccountProfileApp';
import ShareButtonDropdownApp from './startup/ShareButtonDropdownApp';
import ProjectHeaderDistrictsApp from './startup/ProjectHeaderDistrictsApp';
import ProjectHeaderAuthorsApp from './startup/ProjectHeaderAuthorsApp';
import SectionListPageApp from './startup/SectionListPageApp';
import ProjectListPageApp from './startup/ProjectListPageApp';
import ShieldApp from './startup/ShieldApp';
import EvaluationsIndexPageApp from './startup/EvaluationsIndexPageApp';
import ChooseAUsernameApp from './startup/ChooseAUsernameApp';
import ParisUserNotValidApp from './startup/ParisUserNotValidApp';
import AccountProfileFollowingsApp from './startup/AccountProfileFollowingsApp';
import EditProfileApp from './startup/EditProfileApp';
import CookieContentApp from './startup/CookieContentApp';
import CookieManagerApp from './startup/CookieManagerApp';
import PrivacyApp from './startup/PrivacyApp';
import CookieApp from './startup/CookieApp';
import ProjectRestrictedAccessAlertApp from './startup/ProjectRestrictedAccessAlertApp';
import ProjectRestrictedAccessApp from './startup/ProjectRestrictedAccessApp';
import ArgumentListApp from './startup/ArgumentListApp';
import VoteListApp from './startup/VoteListApp';
import EventApp from './startup/EventApp';
import EventPageApp from './startup/EventPageApp';
import ProjectTrashCommentApp from './startup/ProjectTrashCommentApp';
import ProjectTrashProposalApp from './startup/ProjectTrashProposalApp';
import EventListApp from './startup/EventListApp';
import ContactsListPage from './startup/ContactsListPage';
import ReplyPageApp from './startup/ReplyPageApp';
import ContactPage from './startup/ContactPage';
import SectionPageApp from './startup/SectionPageApp';
import OpinionVersionListPageApp from './startup/OpinionVersionListPageApp';
import SSOSwitchUserApp from './startup/SSOSwitchUserApp';
import LastProposalsApp from './startup/LastProposalsApp';
import HomePageEventsApp from './startup/HomePageEventsApp';
import PresentationStepEventsApp from './startup/PresentationStepEventsApp';
import StepEventsApp from './startup/StepEventsApp';
import ProfileUserCommentApp from './startup/ProfileUserCommentApp';
import ConsultationListPageApp from './startup/ConsultationListPageApp';
import ProjectTrashApp from './startup/ProjectTrashApp';
import AccordionApp from './startup/AccordionApp';
import FooterApp from './startup/FooterApp';
import CalendarApp from './startup/CalendarApp';
import EngagementListApp from './startup/EngagementListApp';
import LanguageButtonApp from '~/startup/LanguageButtonApp';
import appStore from '~/stores/AppStore';
import UserInvitationPageApp from '~/startup/UserInvitationPageApp';

ReactOnRails.registerStore({ appStore });

ReactOnRails.register({
  NavbarApp,
  LastProposalsApp,
  AccountProfileFollowingsApp,
  ContactsListPage,
  ContactPage,
  ChooseAUsernameApp,
  ParisUserNotValidApp,
  ShieldApp,
  HomePageEventsApp,
  PresentationStepEventsApp,
  ProjectListPageApp,
  ProjectsListApp,
  ProposalStepPageApp,
  EmailNotConfirmedApp,
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
  ConsultationListPageApp,
  UserProposalsApp,
  ProposalsUserVotesPageApp,
  ShareButtonDropdownApp,
  ProjectHeaderAuthorsApp,
  ProjectHeaderDistrictsApp,
  EditProfileApp,
  CookieManagerApp,
  PrivacyApp,
  CookieApp,
  CookieContentApp,
  ProjectRestrictedAccessAlertApp,
  ProjectRestrictedAccessApp,
  ArgumentListApp,
  VoteListApp,
  EventApp,
  EventPageApp,
  ProjectTrashCommentApp,
  ProjectTrashProposalApp,
  EventListApp,
  SSOSwitchUserApp,
  SourcePageApp,
  SectionListPageApp,
  MetaStepNavigationApp,
  ReplyPageApp,
  ProfileUserCommentApp,
  ProjectTrashApp,
  OpinionVersionListPageApp,
  AccordionApp,
  FooterApp,
  CalendarApp,
  EngagementListApp,
  LanguageButtonApp,
  StepEventsApp,
  UserInvitationPageApp,
});
