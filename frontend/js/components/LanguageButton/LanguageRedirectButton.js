// @flow
import React from 'react';
import { useIntl } from 'react-intl';
import {
  DropdownLanguageButton,
  MenuLanguageItem,
} from '~/components/LanguageButton/LanguageButton';
import { LanguageContainer, LanguageTitle } from '~/components/LanguageButton/Language';

type CurrentLanguageProps = {|
  language: string,
|};

type AvailableLanguageProps = {|
  id: string,
  redirect: string,
  traductionKey: string,
|};

export type Props = {|
  languages: [AvailableLanguageProps],
  currentLanguage: string,
|};

const Language = ({ language }: CurrentLanguageProps) => {
  const intl = useIntl();
  return (
    <LanguageContainer>
      {/* <Dot green={language.translated} /> */}
      <LanguageTitle>{intl.formatMessage({ id: language })}</LanguageTitle>
    </LanguageContainer>
  );
};

export const LanguageRedirectButton = ({ languages, currentLanguage }: Props) => {
  return (
    <DropdownLanguageButton bsStyle="default" title={<Language language={currentLanguage} />}>
      {languages.map(language => (
        <MenuLanguageItem key={language.id} href={language.redirect}>
          <Language language={language.traductionKey} />
        </MenuLanguageItem>
      ))}
    </DropdownLanguageButton>
  );
};

export default LanguageRedirectButton;
