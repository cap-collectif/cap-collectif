// @flow
import React, { useState } from 'react';
import { DropdownButton, MenuItem } from 'react-bootstrap';
import styled, { type StyledComponent } from 'styled-components';

export type LanguageStatus = {|
  language: string,
  translated: boolean,
|};

type Props = {|
  onChange: string => void,
  languageList: Array<LanguageStatus>,
  defaultLanguage: string,
  pullRight?: boolean,
|};

const Dot: StyledComponent<{ green: boolean }, {}, HTMLDivElement> = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 10px;
  background-color: ${props => (props.green ? '#088a20' : '#dc3545')};
  align-self: center;
  margin-right: 10px;
`;

const Language: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  font-family: 'OpenSans', helvetica, arial, sans-serif;
  font-size: 16px;
`;

const LanguageContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
`;

const DropownLanguageButton: StyledComponent<{}, {}, DropdownButton> = styled(DropdownButton)`
  display: flex;
  background: rgba(108, 117, 125, 0.2);
  border-radius: 4px;
  .caret {
    align-self: center;
    margin-left: 6px;
  }
`;

const MenuLanguageItem: StyledComponent<{}, {}, MenuItem> = styled(MenuItem)`
  margin-bottom: 5px;
`;

const renderLanguage = (language: LanguageStatus) => {
  return (
    <LanguageContainer>
      <Dot green={language.translated} />
      <Language>{language.language}</Language>
    </LanguageContainer>
  );
};

const LanguageChangeButton = ({ onChange, languageList, defaultLanguage, pullRight }: Props) => {
  const [currentLanguage, updateLanguage] = useState(
    languageList.find(e => e.language === defaultLanguage),
  );
  if (!currentLanguage) return null;
  return (
    <DropownLanguageButton
      bsStyle="default"
      pullRight={pullRight}
      onClick={onChange}
      title={renderLanguage(currentLanguage)}>
      {languageList
        .filter(language => language.language !== currentLanguage.language)
        .map(language => (
          <MenuLanguageItem
            key={language.language}
            onClick={() => {
              updateLanguage(language);
              onChange(language.language);
            }}>
            {renderLanguage(language)}
          </MenuLanguageItem>
        ))}
    </DropownLanguageButton>
  );
};

export default LanguageChangeButton;
