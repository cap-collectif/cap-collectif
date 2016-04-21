import ReactOnRails from 'react-on-rails';
import ProjectsListApp from './ProjectsListAppServer';
import CollectStepPageApp from '../js/startup/CollectStepPageApp';
import SelectionStepPageApp from '../js/startup/SelectionStepPageApp';
import configureStore from '../js/stores/AppStore';
const appStore = configureStore;

const register = ReactOnRails.register;
const registerStore = ReactOnRails.registerStore;

registerStore({ appStore });
register({ ProjectsListApp });
register({ CollectStepPageApp })
register({ SelectionStepPageApp });
