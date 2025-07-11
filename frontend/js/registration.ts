import ReactOnRails from 'react-on-rails'
import ProjectsListApp from './startup/ProjectsListAppClient'
import CustomProjectsListApp from './startup/CustomProjectsListApp'
import NavbarApp from './startup/NavbarAppClient'
import EmailNotConfirmedApp from './startup/EmailNotConfirmedAppClient'
import ProjectTrashButtonApp from './startup/ProjectTrashButtonApp'
import CarouselApp from './startup/CarouselApp'
import MetricsApp from './startup/MetricsApp'
import OpinionPageApp from './startup/OpinionPageApp'
import CommentSectionApp from './startup/CommentSectionApp'
import ProposalVoteBasketWidgetApp from './startup/ProposalVoteBasketWidgetApp'
import ConsultationPageApp from './startup/ConsultationPageApp'
import MetaStepNavigationApp from './startup/MetaStepNavigationApp'
import UserProposalsApp from './startup/UserProposalsApp'
import SourcePageApp from './startup/SourcePageApp'
import ProposalsUserVotesPageApp from './startup/ProposalsUserVotesPageApp'
import AccountProfileApp from './startup/AccountProfileApp'
import ShareButtonDropdownApp from './startup/ShareButtonDropdownApp'
import SectionListPageApp from './startup/SectionListPageApp'
import ShieldApp from './startup/ShieldApp'
import AnalysisPageApp from './startup/AnalysisPageApp'
import ChooseAUsernameApp from './startup/ChooseAUsernameApp'
import ProjectListPageApp from './startup/ProjectListPageApp'
import ParisUserNotValidApp from './startup/ParisUserNotValidApp'
import CasUserNotValidApp from '~/startup/CasUserNotValidApp'
import AccountProfileFollowingsApp from './startup/AccountProfileFollowingsApp'
import EditProfileApp from './startup/EditProfileApp'
import CookieContentApp from './startup/CookieContentApp'
import CookieManagerApp from './startup/CookieManagerApp'
import PrivacyApp from './startup/PrivacyApp'
import CookieApp from './startup/CookieApp'
import ProjectRestrictedAccessAlertApp from './startup/ProjectRestrictedAccessAlertApp'
import ArgumentListApp from './startup/ArgumentListApp'
import VoteListApp from './startup/VoteListApp'
import EventApp from './startup/EventApp'
import EventPageApp from './startup/EventPageApp'
import ProjectTrashCommentApp from './startup/ProjectTrashCommentApp'
import ProjectTrashProposalApp from './startup/ProjectTrashProposalApp'
import EventListApp from './startup/EventListApp'
import ContactsListPage from './startup/ContactsListPage'
import ReplyPageApp from './startup/ReplyPageApp'
import SectionPageApp from './startup/SectionPageApp'
import OpinionVersionListPageApp from './startup/OpinionVersionListPageApp'
import SSOSwitchUserApp from './startup/SSOSwitchUserApp'
import LastProposalsApp from './startup/LastProposalsApp'
import HomePageEventsApp from './startup/HomePageEventsApp'
import StepEventsApp from './startup/StepEventsApp'
import ProfileUserCommentApp from './startup/ProfileUserCommentApp'
import ConsultationListPageApp from './startup/ConsultationListPageApp'
import ProjectTrashApp from './startup/ProjectTrashApp'
import AccordionApp from './startup/AccordionApp'
import FooterApp from './startup/FooterApp'
import CalendarApp from './startup/CalendarApp'
import EngagementListApp from './startup/EngagementListApp'
import LanguageButtonApp from '~/startup/LanguageButtonApp'
import appStore from '~/stores/AppStore'
import UserInvitationPageApp from '~/startup/UserInvitationPageApp'
import ResetPasswordApp from '~/startup/ResetPasswordApp'
import ConsultationStepApp from '~/startup/ConsultationStepApp'
import ProposalPreviewApp from '~/startup/ProposalPreviewApp'
import DebatePreviewApp from '~/startup/DebatePreviewApp'
import UserSliderApp from '~/startup/UserSliderApp'
import GlobalStepApp from '~/startup/GlobalStepApp'
import HomeHeaderApp from '~/startup/HomeHeaderApp'
import ImageSliderApp from '~/startup/ImageSliderApp'
import ParticipationTutorialApp from '~/startup/ParticipationTutorialApp'
import ParticipationMotivationApp from '~/startup/ParticipationMotivationApp'
import ToastsContainerApp from '~/startup/ToastsContainerApp'
import DebateStepPageApp from '~/startup/DebateStepPageApp'
import ProposalNewsHeaderButtonsApp from '~/startup/ProposalNewsHeaderButtonsApp'
import DebateCardApp from '~/startup/DebateCardApp'
import WhatsNewApp from '~/startup/WhatsNewApp'
import ProjectHeaderApp from '~/startup/ProjectHeaderApp'
import DebateWidgetAccessDeniedApp from '~/startup/DebateWidgetAccessDeniedApp'
import UserUnsubscribePageApp from '~/startup/UserUnsubscribePageApp'
import ChartModalApp from '~/startup/ChartModalApp'
import ProjectStepPageApp from './startup/ProjectStepPageApp'
import ProjectsMapViewApp from './startup/ProjectsMapViewApp'
import AccessDeniedAuthApp from './startup/AccessDeniedAuthApp'
import AccessDeniedApp from './startup/AccessDeniedApp'
import IDFGeoSearchBarApp from './startup/IDFGeoSearchBarApp'
import NewsLetterPageApp from './startup/NewsLetterPageApp'
import CarrouselApp from './startup/CarrouselApp'
import UserAvatarApp from './startup/UserAvatarApp'

ReactOnRails.registerStore({
  appStore,
})
ReactOnRails.register({
  ProposalNewsHeaderButtonsApp,
  ToastsContainerApp,
  NavbarApp,
  LastProposalsApp,
  AccountProfileFollowingsApp,
  ContactsListPage,
  ChooseAUsernameApp,
  ParisUserNotValidApp,
  CasUserNotValidApp,
  ShieldApp,
  HomePageEventsApp,
  ProjectListPageApp,
  ProjectsListApp,
  CustomProjectsListApp,
  EmailNotConfirmedApp,
  SectionPageApp,
  AccountProfileApp,
  ProjectTrashButtonApp,
  CarouselApp,
  MetricsApp,
  AnalysisPageApp,
  OpinionPageApp,
  CommentSectionApp,
  ProposalVoteBasketWidgetApp,
  ConsultationPageApp,
  ConsultationListPageApp,
  UserProposalsApp,
  ProposalsUserVotesPageApp,
  ShareButtonDropdownApp,
  EditProfileApp,
  CookieManagerApp,
  PrivacyApp,
  CookieApp,
  CookieContentApp,
  ProjectRestrictedAccessAlertApp,
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
  ProjectHeaderApp,
  DebateWidgetAccessDeniedApp,
  UserUnsubscribePageApp,
  ChartModalApp,
  ProjectStepPageApp,
  ProjectsMapViewApp,
  AccessDeniedAuthApp,
  AccessDeniedApp,
  NewsLetterPageApp,
  CarrouselApp,
  UserAvatarApp,

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
  IDFGeoSearchBarApp,
})
