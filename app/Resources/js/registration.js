import ReactOnRails from 'react-on-rails';
import ProjectsListApp from './startup/ProjectsListAppClient';
import CollectStepPageApp from './startup/CollectStepPageApp';
import SelectionStepPageApp from './startup/SelectionStepPageApp';
import NavbarApp from './startup/NavbarAppClient';
import EmailNotConfirmedApp from './startup/EmailNotConfirmedAppClient';
import NewOpinionApp from './startup/NewOpinionAppClient';
import NewIdeaApp from './startup/NewIdeaAppClient';
import ProjectTrashButtonApp from './startup/ProjectTrashButtonApp';
import appStore from '../js/stores/AppStore';

const register = ReactOnRails.register;
const registerStore = ReactOnRails.registerStore;

registerStore({ appStore });
register({ ProjectsListApp });
register({ CollectStepPageApp });
register({ SelectionStepPageApp });
register({ NavbarApp });
register({ EmailNotConfirmedApp });
register({ NewOpinionApp });
register({ NewIdeaApp });
register({ ProjectTrashButtonApp });
