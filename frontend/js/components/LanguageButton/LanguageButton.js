// @flow
import React, { useState } from 'react';
import styled, { type StyledComponent } from 'styled-components';
import { createFragmentContainer, graphql } from 'react-relay';

import Language from './Language';
import type { LanguageButton_languages } from '~relay/LanguageButton_languages.graphql';
import Menu from '../DesignSystem/Menu/Menu';
import Button from '~ds/Button/Button';
import { ICON_NAME } from '~ds/Icon/Icon';

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

export const DropdownLanguageButton: StyledComponent<{}, {}, typeof Button> = styled(Button)`
  display: flex;
  background: rgba(108, 117, 125, 0.2);
  border-radius: 4px;

  .caret {
    align-self: center;
    margin-left: 6px;
  }
`;

// The API locale code format is upper case with _, like 'FR_CA'
// The frontend locale code format is with -, like 'fr-CA'
export const formatLanguageCode = (languageCode: string) => {
  const splittedLanguageCode = languageCode.split('_');
  return `${splittedLanguageCode[0].toLowerCase()}-${splittedLanguageCode[1]}`;
};

export const LanguageButton = ({ onChange, languages, defaultLanguage }: Props) => {
  const languagesFormatted = languages.map(language => ({
    ...language,
    code: formatLanguageCode(language.code),
  }));

  const [currentLanguage, updateLanguage] = useState(
    languagesFormatted.find(l => l.code === defaultLanguage),
  );

  if (!currentLanguage) return null;
  return (
    <Menu>
      <Menu.Button>
        <DropdownLanguageButton
          rightIcon={ICON_NAME.ARROW_DOWN_O}
          variant="primary"
          variantSize="medium">
          <Language language={currentLanguage} />
        </DropdownLanguageButton>
      </Menu.Button>
      <Menu.List>
        {languagesFormatted.map(language => (
          <Menu.ListItem
            key={language.id}
            onClick={() => {
              updateLanguage(language);
              onChange(language.code);
            }}>
            <Language language={language} />
          </Menu.ListItem>
        ))}
      </Menu.List>
    </Menu>
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
