// @flow
import React, { useState } from 'react';
import { DropdownButton, MenuItem } from 'react-bootstrap';
import styled, { type StyledComponent } from 'styled-components';
import { createFragmentContainer, graphql } from 'react-relay';

import Language from './Language';
import type { LanguageButton_languages } from '~relay/LanguageButton_languages.graphql';

export type LanguageStatus = {|
  id: string,
  name: string,
  translated: boolean,
|};

type Props = {|
  onChange: string => void,
  languages: LanguageButton_languages,
  defaultLanguage: string,
  pullRight?: boolean,
|};

const DropdownLanguageButton: StyledComponent<{}, {}, typeof DropdownButton> = styled(
  DropdownButton,
)`
  display: flex;
  background: rgba(108, 117, 125, 0.2);
  border-radius: 4px;

  .caret {
    align-self: center;
    margin-left: 6px;
  }
`;

const MenuLanguageItem: StyledComponent<{}, {}, typeof MenuItem> = styled(MenuItem)`
  margin-bottom: 5px;
`;

// The API locale code format is upper case with _, like 'FR_CA'
// The frontend locale code forma is with -, like 'fr-CA'
const formatLanguageCode = (languageCode: string) => {
  const splittedLanguageCode = languageCode.split('_');
  return `${splittedLanguageCode[0].toLowerCase()}-${splittedLanguageCode[1]}`;
};

export const LanguageButton = ({ onChange, languages, defaultLanguage, pullRight }: Props) => {
  const languagesFormatted = languages.map(language => ({
    ...language,
    code: formatLanguageCode(language.code),
  }));

  const [currentLanguage, updateLanguage] = useState(
    languagesFormatted.find(l => l.code === defaultLanguage),
  );

  if (!currentLanguage) return null;
  return (
    <DropdownLanguageButton
      bsStyle="default"
      pullRight={pullRight}
      title={<Language language={currentLanguage} />}>
      {languagesFormatted.map(language => (
        <MenuLanguageItem
          key={language.id}
          onClick={() => {
            updateLanguage(language);
            onChange(language.code);
          }}>
          {<Language language={language} />}
        </MenuLanguageItem>
      ))}
    </DropdownLanguageButton>
  );
};

export default createFragmentContainer(LanguageButton, {
  languages: graphql`
    fragment LanguageButton_languages on Locale @relay(plural: true) {
      id
      code
      ...Language_language
    }
  `,
});
