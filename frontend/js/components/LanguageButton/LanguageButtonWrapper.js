// @flow
import React from 'react';
import { connect } from 'react-redux';
import { createFragmentContainer, graphql } from 'react-relay';

import type { State } from '~/types';

import LanguageButton from './LanguageButton';
import type { LanguageButtonWrapper_languages } from '~relay/LanguageButtonWrapper_languages.graphql';

type Props = {|
  defaultLanguage?: ?string,
  languages: LanguageButtonWrapper_languages,
  dispatch: Dispatch,
|};

export const LanguageButtonWrapper = (props: Props) => {
  const onChange = (language: string) => {
    const { dispatch } = props;
    if (language) {
      dispatch({
        type: 'language/CHANGE_LANGUAGE_SELECTED',
        currentLanguage: language,
      });
    }
  };

  const { defaultLanguage, languages } = props;

  return (
    <LanguageButton
      defaultLanguage={defaultLanguage || 'fr-FR'}
      languages={languages}
      onChange={onChange}
    />
  );
};

const mapStateToProps = ({ language }: State) => ({
  defaultLanguage: language.currentLanguage,
});

export const container = connect(mapStateToProps)(LanguageButtonWrapper);

export default createFragmentContainer(container, {
  languages: graphql`
    fragment LanguageButtonWrapper_languages on Locale @relay(plural: true) {
      ...LanguageButton_languages
    }
  `,
});
