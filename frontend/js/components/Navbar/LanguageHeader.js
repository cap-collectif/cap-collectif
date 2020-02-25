/* @flow */
import React from 'react';
import {connect} from 'react-redux';
import type {Dispatch} from '../../types';
import ChangeLanguageOnWebsiteHeader from '~ui/ChangeLanguageOnWebsiteHeader/ChangeLanguageOnWebsiteHeader';
import type {LocaleMap} from '~ui/Button/SiteLanguageChangeButton';
import {changeLocaleAction} from '~/redux/modules/user';
import Fetcher from '~/services/Fetcher';
import CookieMonster from '../../CookieMonster';

type ReactRef<T> = { current: ?T };

export type LocaleChoiceTranslation = {|
  code: string,
  message: string,
  label: string
|};

type StateProps = {|
  +localeChoiceTranslations: Array<LocaleChoiceTranslation>,
  currentRouteParams: Object,
  currentRouteName: string,
  defaultLanguage: string,
  languageList: Array<LocaleMap>,
  innerRef: ReactRef<any>,
  onHeaderClose?: () => void,
|};

type DispatchProps = {|
  +onLocaleChange: () => typeof changeLocaleAction,
|};

type Props = {|
  ...StateProps,
  ...DispatchProps,
|};


const LanguageHeader = ({
                          innerRef,
                          onLocaleChange,
                          onHeaderClose,
                          defaultLanguage,
                          localeChoiceTranslations,
                          languageList,
                          currentRouteName,
                          currentRouteParams,
                        }: Props) => (
  <ChangeLanguageOnWebsiteHeader
    ref={innerRef}
    localeChoiceTranslations={localeChoiceTranslations}
    onChange={(currentLanguage: LocaleMap) => {
      Fetcher.postToJson(`/change-locale/${currentLanguage.code}`, {
        routeName: currentRouteName,
        routeParams: currentRouteParams,
      }).then(response => {
        CookieMonster.setLocale(response.locale);
        CookieMonster.setShouldShowLocaleHeader(false);
        onLocaleChange();
        window.location.href = response.path;
      });
    }}
    onClose={() => {
      CookieMonster.setShouldShowLocaleHeader(false);
      if (typeof onHeaderClose !== 'undefined') {
        onHeaderClose();
      }
    }}
    defaultLanguage={defaultLanguage}
    languageList={languageList}
  />
);

const mapStateToProps = () => ({});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onLocaleChange: () => dispatch(changeLocaleAction()),
});

export default connect(mapStateToProps, mapDispatchToProps)(LanguageHeader);
