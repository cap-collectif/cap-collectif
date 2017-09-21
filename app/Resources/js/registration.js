import moment from 'moment';
import 'moment/locale/fr';
import ReactOnRails from 'react-on-rails';
import { addLocaleData } from 'react-intl';
import frLocaleData from 'react-intl/locale-data/fr';

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
import ConsultationPageApp from './startup/ConsultationPageApp';
import ProposalListApp from './startup/ProposalListApp';
import ProposalsUserVotesPageApp from './startup/ProposalsUserVotesPageApp';
import PhoneProfileApp from './startup/PhoneProfileApp';
import AccountProfileApp from './startup/AccountProfileApp';
import IdeasIndexPageApp from './startup/IdeasIndexPageApp';
import IdeasListApp from './startup/IdeasListApp';
import IdeaPageApp from './startup/IdeaPageApp';
import IdeaCreateApp from './startup/IdeaCreateApp';
import ShareButtonDropdownApp from './startup/ShareButtonDropdownApp';
import ProposalCreateFusionButtonApp from './startup/ProposalCreateFusionButtonApp';
import ProjectListPageApp from './startup/ProjectListPageApp';
import ProposalAdminPageApp from './startup/ProposalAdminPageApp';
import RegistrationAdminApp from './startup/RegistrationAdminApp';
import AdminModalsApp from './startup/AdminModalsApp';
import ShieldApp from './startup/ShieldApp';
import appStore from '../js/stores/AppStore';

addLocaleData(frLocaleData);
if ('ReactIntlLocaleData' in window) {
  Object.keys(ReactIntlLocaleData).forEach(lang => {
    addLocaleData(ReactIntlLocaleData[lang]);
  });
}

moment.locale('fr');
window.__SERVER__ = false;

ReactOnRails.registerStore({ appStore });

ReactOnRails.register({
  AdminModalsApp,
  RegistrationAdminApp,
  ShieldApp,
  ProjectListPageApp,
  ProjectsListApp,
  ProposalAdminPageApp,
  ProposalCreateFusionButtonApp,
  ProposalStepPageApp,
  NavbarApp,
  EmailNotConfirmedApp,
  NewOpinionApp,
  NewIdeaApp,
  AccountProfileApp,
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
  ProposalListApp,
  ProposalsUserVotesPageApp,
  PhoneProfileApp,
  IdeasIndexPageApp,
  IdeasListApp,
  IdeaPageApp,
  IdeaCreateApp,
  ShareButtonDropdownApp,
});
