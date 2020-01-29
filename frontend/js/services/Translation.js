// @flow

import React from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';

import type { State } from '~/types';

type BaseTranslation = {
  +locale: string,
  +[string]: ?string,
};

type TranslationItem<T> = {
  ...T,
  +locale: string,
};

type Translations<T: BaseTranslation> = $ReadOnlyArray<TranslationItem<T>>;

type Props = {
  defaultLanguage: ?string,
  field: string,
  translations: Translations<BaseTranslation>,
  fallback?: ?string,
};

export const getTranslation = <T: BaseTranslation>(
  translations: ?Translations<T>,
  defaultLanguage: ?string,
): ?TranslationItem<T> =>
  translations ? translations.find(({ locale }) => defaultLanguage === locale) || null : null;

export const getTranslationField = <T: BaseTranslation>(
  translations: ?Translations<T>,
  defaultLanguage: ?string,
  field: string,
): string => {
  const translation = getTranslation(translations, defaultLanguage);

  return translation && translation[field] ? translation[field] : '';
};

export function Translation({ field, translations, fallback, defaultLanguage }: Props) {
  const translation = getTranslation(translations, defaultLanguage);

  if (translation && translation[field]) {
    return <strong>{translation[field]}</strong>;
  }
  if (fallback) {
    return <FormattedMessage id={fallback} />;
  }
  return null;
}

export const isTranslationNew = <T: BaseTranslation>(
  translations: Translations<T>,
  defaultLanguage: ?string,
): boolean => !getTranslation(translations, defaultLanguage);

export const handleTranslationChange = <T: BaseTranslation>(
  translationsSource: Translations<T>,
  translationsEdited: TranslationItem<T>,
  defaultLanguage: ?string,
): Translations<T> => {
  // We are creating a new array of translations
  if (translationsSource === []) {
    return [translationsEdited];
  }

  const isCreating = isTranslationNew(translationsSource, defaultLanguage);
  // We are creating a new translation
  if (isCreating) {
    return [...translationsSource, translationsEdited];
  }

  // We are creating a new translation
  if (!isCreating) {
    // We delete the translation from the array
    const translationsFiltered = translationsSource.filter(
      ({ locale }) => defaultLanguage !== locale,
    );

    // We replace the translation by the new one
    return [...translationsFiltered, translationsEdited];
  }

  return [];
};

const mapStateToProps = ({ language }: State) => ({
  defaultLanguage: language.currentLanguage,
});

export default connect(mapStateToProps)(Translation);
