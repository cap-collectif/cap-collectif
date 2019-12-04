// @flow
import * as React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import SiteLanguageChangeButton, {
  type Props,
} from '../components/Ui/Button/SiteLanguageChangeButton';

export default (props: {| ...Props, localesData: Array<{| locale: String, path: string |}> |}) => {
  const { localesData, ...rest } = props;

  const onChange = (locale: string) => {
    const localeToGo = localesData.find(localeDate => localeDate.locale === locale);
    if (localeToGo) window.location.href = localeToGo.path;
  };

  return (
    <Provider store={ReactOnRails.getStore('appStore')}>
      <IntlProvider>
        <SiteLanguageChangeButton {...rest} onChange={onChange} />
      </IntlProvider>
    </Provider>
  );
};
