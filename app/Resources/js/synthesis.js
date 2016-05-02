import React from 'react';
import ReactDOM from 'react-dom';
import { Router, hashHistory } from 'react-router';

import routes from './routes';
import IntlData from './translations/Synthesis/FR';
import SynthesisBox from './components/Synthesis/SynthesisBox';
import AuthService from './services/AuthService';

AuthService
.login()
.then(() => {
  if ($('#render-synthesis-view-box').length) {
    ReactDOM.render(
      <SynthesisBox synthesis_id={$('#render-synthesis-view-box').data('synthesis')} mode="view" {...IntlData} />,
      document.getElementById('render-synthesis-view-box')
    );
  }
  if ($('#render-synthesis-edit-box').length) {
    ReactDOM.render(
      <Router history={hashHistory}>
        {routes}
      </Router>,
      document.getElementById('render-synthesis-edit-box')
    );
  }
});
