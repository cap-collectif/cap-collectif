// @flow
import ReactOnRails from 'react-on-rails';

import ProjectsListApp from './startup/ProjectsListAppClient';
import CustomProjectsListApp from './startup/CustomProjectsListApp';
import ProposalStepPageApp from './startup/ProposalStepPageApp';
import NavbarApp from './startup/NavbarAppClient';
import EmailNotConfirmedApp from './startup/EmailNotConfirmedAppClient';
import ProjectTrashButtonApp from './startup/ProjectTrashButtonApp';
import ProjectStepTabsApp from './startup/ProjectStepTabsApp';
import CarouselApp from './startup/CarouselApp';
import MetricsApp from './startup/MetricsApp';
import OpinionPageApp from './startup/OpinionPageApp';
import CommentSectionApp from './startup/CommentSectionApp';
import ProposalPageApp from './startup/ProposalPageApp';
import QuestionnaireStepPageApp from './startup/QuestionnaireStepPageApp';
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
import ProjectHeaderCounterApp from './startup/ProjectHeaderCounterApp';
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
import ResetPasswordApp from '~/startup/ResetPasswordApp';
import ConsultationStepApp from '~/startup/ConsultationStepApp';
import ProposalPreviewApp from '~/startup/ProposalPreviewApp';
import DebatePreviewApp from '~/startup/DebatePreviewApp';
import UserSliderApp from '~/startup/UserSliderApp';
import GlobalStepApp from '~/startup/GlobalStepApp';
import HomeHeaderApp from '~/startup/HomeHeaderApp';
import ImageSliderApp from '~/startup/ImageSliderApp';
import ParticipationTutorialApp from '~/startup/ParticipationTutorialApp';
import ParticipationMotivationApp from '~/startup/ParticipationMotivationApp';
import ToastsContainerApp from '~/startup/ToastsContainerApp';
import DebateStepPageApp from '~/startup/DebateStepPageApp';
import ProposalNewsHeaderButtonsApp from '~/startup/ProposalNewsHeaderButtonsApp';
import DebateCardApp from '~/startup/DebateCardApp';
import WhatsNewApp from '~/startup/WhatsNewApp';
import DebateWidgetAccessDeniedApp from '~/startup/DebateWidgetAccessDeniedApp';
import UserUnsubscribePageApp from '~/startup/UserUnsubscribePageApp';
import ChartModalApp from '~/startup/ChartModalApp';

ReactOnRails.registerStore({ appStore });

ReactOnRails.register({
  ProposalNewsHeaderButtonsApp,
  ToastsContainerApp,
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
  CustomProjectsListApp,
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
  ProposalPageApp,
  QuestionnaireStepPageApp,
  ProposalVoteBasketWidgetApp,
  AlertBoxApp,
  ConsultationPageApp,
  ConsultationListPageApp,
  UserProposalsApp,
  ProposalsUserVotesPageApp,
  ShareButtonDropdownApp,
  ProjectHeaderAuthorsApp,
  ProjectHeaderCounterApp,
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
  FooterApp,
  LanguageButtonApp,
  StepEventsApp,
  UserInvitationPageApp,
  ResetPasswordApp,
  DebateStepPageApp,
  DebateWidgetAccessDeniedApp,
  UserUnsubscribePageApp,
  ChartModalApp,

  /* # COMPONENTS INTE CLIENT # */
  CalendarApp,
  EngagementListApp,
  AccordionApp,
  ConsultationStepApp,
  ProposalPreviewApp,
  DebatePreviewApp,
  UserSliderApp,
  GlobalStepApp,
  HomeHeaderApp,
  ImageSliderApp,
  ParticipationTutorialApp,
  ParticipationMotivationApp,
  DebateCardApp,
  WhatsNewApp,
});
