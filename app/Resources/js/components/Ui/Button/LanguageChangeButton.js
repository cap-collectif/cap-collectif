// @flow
import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { DropdownButton } from 'react-bootstrap';
import styled, { type StyledComponent } from 'styled-components';

export type LanguageStatus = {|
  language: string,
  translated: boolean,
|};

type Props = {|
  onChange: () => void,
  languageList: Array<LanguageStatus>,
  defaultLanguage: LanguageStatus,
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
`;

const LanguageContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
`;

const renderLanguage = (language: LanguageStatus) => {
  return (
    <LanguageContainer>
      <Dot green={language.translated} />
      <Language>{language.language}</Language>
    </LanguageContainer>
  );
};

const LanguageChangeButton = ({ onChange, languageList, defaultLanguage }: Props) => {
  const [currentLanguage, updateLanguage] = useState(defaultLanguage);
  return (
    <DropdownButton
      bsStyle="default"
      className="btn-outline-warning"
      onClick={onChange}
      title={renderLanguage(currentLanguage)}>
      <i className="fa fa-pencil" />
      {updateLanguage}
      {languageList}
      <span className="hidden-xs">
        <FormattedMessage id="global.edit" className="hidden-xs" />
      </span>
    </DropdownButton>
  );
};

export default LanguageChangeButton;
