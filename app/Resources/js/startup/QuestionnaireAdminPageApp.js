import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import { IntlProvider } from 'react-intl-redux';
import QuestionnaireAdminPage from '../components/Questionnaire/QuestionnaireAdminPage';

/**
 * @see https://github.com/yahoo/react-intl/issues/999#issuecomment-335799491
 * In order to delete "<span> cannot appear as a child of <option>" warning
 */
function Fragment(props) {
  return props.children || <span {...props} /> || null;
}

export default props => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider textComponent={Fragment}>
      <QuestionnaireAdminPage {...props} />
    </IntlProvider>
  </Provider>
);
