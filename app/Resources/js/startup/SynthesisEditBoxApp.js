import React, { PropTypes } from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import { Router, hashHistory, IndexRoute, Route } from 'react-router';
import ElementsInbox from '../components/Synthesis/Inbox/ElementsInbox';
import ElementsSearch from '../components/Synthesis/ElementsSearch';
import FolderManager from '../components/Synthesis/FolderManager';
import Settings from '../components/Synthesis/Settings/Settings';
import DisplaySettings from '../components/Synthesis/Settings/DisplaySettings';
import EditElement from '../components/Synthesis/Edit/EditElement';
import Preview from '../components/Synthesis/View/Preview';
import SynthesisBox from '../components/Synthesis/SynthesisBox';

export default (props) => {
  const store = ReactOnRails.getStore('appStore');

  const redirectToDefaultInbox = (nextState, replace) => {
    replace({
      pathname: '/inbox/new',
    });
  };

  const redirectToFirstSettings = (nextState, replace) => {
    replace({
      pathname: '/settings/display',
    });
  };

  const SynthesisBoxWrapper = React.createClass({
    propTypes: {
      children: PropTypes.object.isRequired,
    },
    render() {
      const { children } = this.props;
      const showSideMenu = children.type.displayName !== 'Settings';
      return (
        <SynthesisBox
          {...props}
          sideMenu={showSideMenu}
        >
          {children}
        </SynthesisBox>
      );
    },
  });

  return (
    <Provider store={store}>
      <Router history={hashHistory}>
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
          <Route path="settings" component={Settings} >
            <IndexRoute component={Settings} onEnter={redirectToFirstSettings} />
            <Route path="display" component={DisplaySettings} />
          </Route>
        </Route>
      </Router>
    </Provider>
  );
};
