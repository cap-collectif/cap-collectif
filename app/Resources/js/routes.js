import SynthesisBox from './components/Synthesis/SynthesisBox';
import ElementsInbox from './components/Synthesis/ElementsInbox';
import ElementsTree from './components/Synthesis/ElementsTree';
import EditElement from './components/Synthesis/EditElement';

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
    <Route name="tree" path="tree" handler={ElementsTree} />
    <Route name="show_element" path="element/:element_id" handler={EditElement} />
  </Route>
);
