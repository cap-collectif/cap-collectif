// @flow
import React, { useState } from 'react';
import { DropdownButton, MenuItem } from 'react-bootstrap';
import styled, { type StyledComponent } from 'styled-components';

export type LanguageStatus = {|
  name: string,
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

const DropdownLanguageButton: StyledComponent<{}, {}, DropdownButton> = styled(DropdownButton)`
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

const renderLanguage = (language: LanguageStatus) => (
  <LanguageContainer>
    <Dot green={language.translated} />
    <Language>{language.name}</Language>
  </LanguageContainer>
);

const LanguageChangeButton = ({ onChange, languageList, defaultLanguage, pullRight }: Props) => {
  const [currentLanguage, updateLanguage] = useState(
    languageList.find(e => e.name === defaultLanguage),
  );
  if (!currentLanguage) return null;
  return (
    <DropdownLanguageButton
      bsStyle="default"
      pullRight={pullRight}
      onClick={onChange}
      title={renderLanguage(currentLanguage)}>
      {languageList
        .filter(language => language.name !== currentLanguage.name)
        .map(language => (
          <MenuLanguageItem
            key={language.name}
            onClick={() => {
              updateLanguage(language);
              onChange(language.name);
            }}>
            {renderLanguage(language)}
          </MenuLanguageItem>
        ))}
    </DropdownLanguageButton>
  );
};

export default LanguageChangeButton;
