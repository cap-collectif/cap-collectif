import ReactOnRails from 'react-on-rails';
import ProjectsListApp from '../js/ProjectsListAppClient';
import CollectStepPageApp from '../js/startup/CollectStepPageApp';
import SelectionStepPageApp from '../js/startup/SelectionStepPageApp';
import NavbarApp from '../js/startup/NavbarAppClient';
import EmailNotConfirmedApp from '../js/startup/EmailNotConfirmedAppClient';
import NewOpinionApp from '../js/startup/NewOpinionAppClient';
import NewIdeaApp from '../js/startup/NewIdeaAppClient';
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
