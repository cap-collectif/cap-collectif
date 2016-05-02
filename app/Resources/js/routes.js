import React from 'react';
import { IndexRoute, Route } from 'react-router';
import SynthesisBox from './components/Synthesis/SynthesisBox';
import ElementsInbox from './components/Synthesis/Inbox/ElementsInbox';
import ElementsSearch from './components/Synthesis/ElementsSearch';
import FolderManager from './components/Synthesis/FolderManager';
import EditElement from './components/Synthesis/Edit/EditElement';
import Preview from './components/Synthesis/View/Preview';
import IntlData from './translations/Synthesis/FR';

const redirectToDefaultInbox = (nextState, replace) => {
  replace({
    pathname: '/inbox/new',
  });
};

const SynthesisBoxWrapper = React.createClass({
  propTypes: {
    children: React.PropTypes.object.isRequired,
  },
  render() {
    return (
      <SynthesisBox
        synthesis_id={$('#render-synthesis-edit-box').data('synthesis')}
        mode="edit"
        children={this.props.children}
        {...IntlData}
      />
    );
  },
});

export default (
  <Route path="/" component={SynthesisBoxWrapper}>
    <IndexRoute component={SynthesisBoxWrapper} onEnter={redirectToDefaultInbox} />
    <Route path="inbox">
      <IndexRoute component={ElementsInbox} onEnter={redirectToDefaultInbox} />
      <Route path=":type" component={ElementsInbox} />
    </Route>
    <Route path="search/:term" component={ElementsSearch} />
    <Route path="folder-manager" component={FolderManager} />
    <Route path="element/:element_id" component={EditElement} />
    <Route path="preview" component={Preview} />
  </Route>
);
