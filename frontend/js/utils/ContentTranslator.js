// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';

export const TO_TRANSLATE = ['deleted-title', 'deleted-content-by-author', 'deleted-user'];

export const isPredefinedTraductionKey = (value: string): boolean => {
  return TO_TRANSLATE.includes(value);
};

/**
 * This function is used when rendering the body or the title of a content
 * to "catch" a predefined translation key and translate it.
 * E.g. for a deleted content.
 */
export const translateContent = (value: ?string) => {
  if (value && isPredefinedTraductionKey(value)) {
    return <FormattedMessage id={value} />;
  }

  return value;
};
