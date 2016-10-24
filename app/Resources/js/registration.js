import moment from 'moment';
import 'moment/locale/fr';

moment.locale('fr');

import ReactOnRails from 'react-on-rails';
import ProjectsListApp from './startup/ProjectsListAppClient';
import ProposalStepPageApp from './startup/ProposalStepPageApp';
import NavbarApp from './startup/NavbarAppClient';
import EmailNotConfirmedApp from './startup/EmailNotConfirmedAppClient';
import NewOpinionApp from './startup/NewOpinionAppClient';
import NewIdeaApp from './startup/NewIdeaAppClient';
import ProjectTrashButtonApp from './startup/ProjectTrashButtonApp';
import OpinionPageApp from './startup/OpinionPageApp';
import CommentSectionApp from './startup/CommentSectionApp';
import SynthesisViewBoxApp from './startup/SynthesisViewBoxApp';
import SynthesisEditBoxApp from './startup/SynthesisEditBoxApp';
import ProposalPageApp from './startup/ProposalPageApp';
import QuestionnaireStepPageApp from './startup/QuestionnaireStepPageApp';
import ProjectStatsPageApp from './startup/ProjectStatsPageApp';
import ProposalVoteBasketWidgetApp from './startup/ProposalVoteBasketWidgetApp';
import AlertBoxApp from './startup/AlertBoxApp';
import StepInfosApp from './startup/StepInfosApp';
import ProposalListApp from './startup/ProposalListApp';
import ProposalsUserVotesPageApp from './startup/ProposalsUserVotesPageApp';
import PhoneProfileApp from '../js/startup/PhoneProfileApp';
import IdeasIndexPageApp from './startup/IdeasIndexPageApp';
import IdeasListApp from './startup/IdeasListApp';
import IdeaPageApp from './startup/IdeaPageApp';
import IdeaCreateApp from './startup/IdeaCreateApp';
import ShareButtonDropdownApp from './startup/ShareButtonDropdownApp';
import ProposalCreateFusionButtonApp from './startup/ProposalCreateFusionButtonApp';
import appStore from '../js/stores/AppStore';

const register = ReactOnRails.register;
const registerStore = ReactOnRails.registerStore;

window.__SERVER__ = false;

registerStore({ appStore });
register({
  ProjectsListApp,
  ProposalCreateFusionButtonApp,
  ProposalStepPageApp,
  NavbarApp,
  EmailNotConfirmedApp,
  NewOpinionApp,
  NewIdeaApp,
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
  StepInfosApp,
  ProposalListApp,
  ProposalsUserVotesPageApp,
  PhoneProfileApp,
  IdeasIndexPageApp,
  IdeasListApp,
  IdeaPageApp,
  IdeaCreateApp,
  ShareButtonDropdownApp,
});
