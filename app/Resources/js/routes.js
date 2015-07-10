'use strict';

import SynthesisBox from './components/Synthesis/SynthesisBox';

import ElementsInbox from './components/Synthesis/ElementsInbox';
import ElementsTree from './components/Synthesis/ElementsTree';

import EditElement from './components/Synthesis/EditElement';

let Route = ReactRouter.Route;
let DefaultRoute = ReactRouter.DefaultRoute;

var RedirectToDefaultInbox =
  React.createClass({
    statics: {
      willTransitionTo (transition, params) {
        transition.redirect('/inbox/new');
      }
    },
    render() {
      return null;
    }
  });

export default (
  <Route handler={SynthesisBox}>
    <DefaultRoute handler={RedirectToDefaultInbox} />
    <Route path="inbox">
      <DefaultRoute handler={RedirectToDefaultInbox} />
      <Route name="inbox" path=":type" handler={ElementsInbox} />
    </Route>
    <Route name="tree" path="tree" handler={ElementsTree} />
    <Route name="new_folder" path="new-folder" handler={ElementsInbox} />
    <Route name="show_element" path="element/:element_id" handler={EditElement} />
  </Route>
);