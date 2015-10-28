import SynthesisBox from './components/Synthesis/SynthesisBox';
import ElementsInbox from './components/Synthesis/ElementsInbox';
import FolderManager from './components/Synthesis/FolderManager';
import EditElement from './components/Synthesis/EditElement';
import ViewBox from './components/Synthesis/ViewBox';

const Route = ReactRouter.Route;
const DefaultRoute = ReactRouter.DefaultRoute;

const RedirectToDefaultInbox = React.createClass({
  statics: {
    willTransitionTo(transition) {
      transition.redirect('/inbox/new');
    },
  },

  render() {
    return null;
  },

});

export default (
  <Route handler={SynthesisBox}>
    <DefaultRoute handler={RedirectToDefaultInbox} />
    <Route path="inbox">
      <DefaultRoute handler={RedirectToDefaultInbox} />
      <Route name="inbox" path=":type" handler={ElementsInbox} />
    </Route>
    <Route name="folder_manager" path="folder-manager" handler={FolderManager} />
    <Route name="show_element" path="element/:element_id" handler={EditElement} />
    <Route name="preview" path="preview" handler={ViewBox} />
  </Route>
);
