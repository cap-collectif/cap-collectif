'use strict';

import SynthesisBox from './components/Synthesis/SynthesisBox';

import ElementsInbox from './components/Synthesis/ElementsInbox';
import ElementsArchived from './components/Synthesis/ElementsArchived';
import ElementsUnpublished from './components/Synthesis/ElementsUnpublished';
import ElementsAll from './components/Synthesis/ElementsAll';
import ElementsTree from './components/Synthesis/ElementsTree';

import EditElement from './components/Synthesis/EditElement';

let Route = ReactRouter.Route;
let DefaultRoute = ReactRouter.DefaultRoute;

export default (
  <Route handler={SynthesisBox}>
    <DefaultRoute name="inbox" handler={ElementsInbox} />
    <Route name="archived" path="archived" handler={ElementsArchived} />
    <Route name="unpublished" path="unpublished" handler={ElementsUnpublished} />
    <Route name="all" path="all" handler={ElementsAll} />
    <Route name="tree" path="tree" handler={ElementsTree} />
    <Route name="new_folder" path="new-folder" handler={ElementsInbox} />
    <Route name="show_element" path="element/:element_id" handler={EditElement} />
  </Route>
);