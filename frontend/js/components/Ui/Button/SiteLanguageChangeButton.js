// @flow
import React, { useState } from 'react';
import { DropdownButton, MenuItem } from 'react-bootstrap';
import styled, { type StyledComponent } from 'styled-components';
import EarthIcon from '../Icons/EarthIcon';

export type Props = {|
  onChange: string => void,
  languageList: Array<string>,
  defaultLanguage: string,
  pullRight: boolean,
  dropup: boolean,
  minWidth?: number,
  textColor: string,
  backgroundColor: string,
  small: boolean,
  borderless: boolean,
|};

const Language: StyledComponent<{ color: string }, {}, HTMLDivElement> = styled.div`
  font-family: 'OpenSans', helvetica, arial, sans-serif;
  font-size: 16px;
  color: ${props => props.color};
`;

const LanguageContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
`;

const DropdownLanguageButton: StyledComponent<
  { minWidth?: number, backgroundColor: string, borderless: boolean, small: boolean },
  {},
  DropdownButton,
> = styled(DropdownButton)`
  display: flex;
  justify-content: space-between;
  min-width: ${props => (props.minWidth !== undefined ? `${props.minWidth}px` : '100%')};
  height: ${props => props.small && '50px'};
  background: ${({ backgroundColor }) => `${backgroundColor} ` || 'rgba(108, 117, 125, 0.2)'};
  border: ${props => props.borderless && 'none'};
  border-radius: 4px;
  .caret {
    align-self: center;
    margin-left: 6px;
  }
`;

const MenuLanguageItem: StyledComponent<{ small: boolean }, {}, MenuItem> = styled(MenuItem)`
  margin-bottom: 5px;
  font-family: 'OpenSans', helvetica, arial, sans-serif;
  font-size: 16px;

  a {
    color: #000 !important;
    padding-left: ${props => props.small && '10px !important'};
    display: flex !important;
  }
`;

const SiteEarthIcon: StyledComponent<{ small: boolean }, {}, typeof EarthIcon> = styled(EarthIcon)`
  margin-top: ${props => !props.small && '3px'};
  margin-right: ${props => !props.small && '15px'};
`;

export const Caret: StyledComponent<{ color: string }, {}, HTMLElement> = styled.i`
  color: ${props => props.color};
  height: 15px;
  width: 15px;
  margin-top: 5px;
  margin-left: 10px;
`;

const Placeholder: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  width: 21px;
`;

const renderCurrentLanguage = (language: string, textColor: string, small: boolean) => (
  <>
    <LanguageContainer>
      <SiteEarthIcon color={textColor} small={small} />
      {!small && <Language color={textColor}>{language}</Language>}
    </LanguageContainer>
    {!small && <Caret className="cap-arrow-39" color={textColor} />}
  </>
);

const SiteLanguageChangeButton = ({
  onChange,
  languageList,
  defaultLanguage,
  pullRight,
  dropup,
  minWidth,
  textColor,
  backgroundColor,
  small,
  borderless,
}: Props) => {
  const [currentLanguage, updateLanguage] = useState(
    languageList && languageList.find(e => e === defaultLanguage),
  );
  if (!currentLanguage) return null;
  return (
    <DropdownLanguageButton
      id="language-change-button-dropdown"
      minWidth={minWidth}
      backgroundColor={backgroundColor}
      bsStyle="default"
      pullRight={pullRight}
      dropup={dropup}
      borderless={borderless}
      noCaret={!small}
      small={small}
      title={renderCurrentLanguage(currentLanguage, textColor, small)}>
      {languageList
        .filter(language => language !== currentLanguage || small)
        .map(language => (
          <MenuLanguageItem
            key={language}
            small={small}
            onClick={() => {
              updateLanguage(language);
              onChange(language);
            }}>
            {small &&
              (language === currentLanguage ? (
                <i className="cap-android-done mr-5" />
              ) : (
                <Placeholder />
              ))}
            <span>{language}</span>
          </MenuLanguageItem>
        ))}
    </DropdownLanguageButton>
  );
};
SiteLanguageChangeButton.defaultProps = {
  small: false,
  pullRight: false,
  textColor: '#000',
  backgroundColor: '#FFF',
  dropup: false,
  borderless: false,
};

export default SiteLanguageChangeButton;
