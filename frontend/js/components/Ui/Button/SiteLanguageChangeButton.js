// @flow
import React, { useState } from 'react';
import { DropdownButton, MenuItem } from 'react-bootstrap';
import styled, { type StyledComponent } from 'styled-components';
import EarthIcon from '../Icons/EarthIcon';

export type LocaleMap = {|
  translationKey: string,
  code: string,
|};

type Props = {|
  id?: ?string,
  onChange: LocaleMap => void,
  languageList: Array<LocaleMap>,
  defaultLanguage: string,
  pullRight: boolean,
  dropup: boolean,
  minWidth?: number,
  maxWidth?: number,
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
  { minWidth?: number, maxWidth?: number, backgroundColor: string, borderless: boolean },
  {},
  typeof DropdownButton,
> = styled(DropdownButton)`
  display: flex;
  justify-content: space-between;
  min-width: ${props => (props.minWidth !== undefined ? `${props.minWidth}px` : '100%')};
  max-width: ${props => (props.maxWidth !== undefined ? `${props.maxWidth}px` : '100%')};
  background: ${({ backgroundColor }) => `${backgroundColor} ` || 'rgba(108, 117, 125, 0.2)'};
  border: ${props => props.borderless && 'none'};
  border-radius: 4px;

  .caret {
    align-self: center;
    margin-left: 6px;
  }
`;

const MenuLanguageItem: StyledComponent<{ small: boolean }, {}, typeof MenuItem> = styled(MenuItem)`
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
  margin-top: 3px;
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

const renderCurrentLanguage = (language: LocaleMap, textColor: string, small: boolean) => (
    <>
      <LanguageContainer>
        <SiteEarthIcon color={textColor} small={small} />
        {!small && (
          <Language color={textColor}>
            <span>{language.translationKey}</span>
          </Language>
        )}
      </LanguageContainer>
      {!small && <Caret id="language-change-caret" className="cap-arrow-39" color={textColor} />}
    </>
);

const SiteLanguageChangeButton = ({
  onChange,
  languageList,
  defaultLanguage,
  pullRight,
  dropup,
  minWidth,
  maxWidth,
  textColor,
  backgroundColor,
  small,
  borderless,
}: Props) => {
  const [currentLanguage, updateLanguage] = useState(
    languageList.find(e => e.code === defaultLanguage),
  );
  if (!currentLanguage) return null;

  return (
    <DropdownLanguageButton
      id="language-change-button-dropdown"
      minWidth={minWidth}
      maxWidth={maxWidth}
      backgroundColor={backgroundColor}
      bsStyle="default"
      pullRight={pullRight}
      dropup={dropup}
      borderless={borderless}
      noCaret={!small}
      title={renderCurrentLanguage(currentLanguage, textColor, small)}>
      {languageList
        .filter(language => language.code !== currentLanguage.code || small)
        .sort(
        (l1: LocaleMap, l2: LocaleMap) => {
          return (l1.translationKey >= l2.translationKey) ? 1 : -1;
        })
        .map(language => (
          <MenuLanguageItem
            id={`language-choice-${language.code}`}
            key={language.code}
            small={small}
            onClick={() => {
              updateLanguage(language);
              onChange(language);
            }}>
            {small &&
            (language.code === currentLanguage ? (
              <i className="cap-android-done mr-5" />
            ) : (
              <Placeholder />
            ))}
            <span>{language.translationKey}</span>
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
