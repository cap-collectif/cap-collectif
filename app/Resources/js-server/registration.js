import ReactOnRails from 'react-on-rails';
import ProjectsListApp from './ProjectsListAppServer';
import CollectStepPageApp from '../js/startup/CollectStepPageApp';
import SelectionStepPageApp from '../js/startup/SelectionStepPageApp';
import NavbarRightApp from '../js/startup/NavbarRightAppClient';
import EmailNotConfirmedApp from '../js/startup/EmailNotConfirmedAppClient';
import appStore from '../js/stores/AppStore';

const register = ReactOnRails.register;
const registerStore = ReactOnRails.registerStore;

registerStore({ appStore });
register({ ProjectsListApp });
register({ CollectStepPageApp });
register({ SelectionStepPageApp });
register({ NavbarRightApp });
register({ EmailNotConfirmedApp });
