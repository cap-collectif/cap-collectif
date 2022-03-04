// @flow
import React, { useState } from 'react';
import styled, { type StyledComponent } from 'styled-components';
import EarthIcon from '../Icons/EarthIcon';
import Menu from '../../DesignSystem/Menu/Menu';
import Button from '~ds/Button/Button';

export type LocaleMap = {|
  translationKey: string,
  code: string,
|};

type Props = {|
  id?: ?string,
  onChange: LocaleMap => void,
  languageList: Array<LocaleMap>,
  defaultLanguage: string,
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
  typeof Button,
> = styled(Button)`
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
    <Menu placement="top">
      <Menu.Button>
        <DropdownLanguageButton
          id="language-change-button-dropdown"
          minWidth={minWidth}
          maxWidth={maxWidth}
          backgroundColor={backgroundColor}
          borderless={borderless}
          variant="primary"
          variantSize="medium">
          {renderCurrentLanguage(currentLanguage, textColor, small)}
        </DropdownLanguageButton>
      </Menu.Button>
      <Menu.List>
        {languageList
          .filter(language => language.code !== currentLanguage.code || small)
          .sort((l1: LocaleMap, l2: LocaleMap) => {
            return l1.translationKey >= l2.translationKey ? 1 : -1;
          })
          .map(language => (
            <Menu.ListItem
              id={`language-choice-${language.code}`}
              key={language.code}
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
            </Menu.ListItem>
          ))}
      </Menu.List>
    </Menu>
  );
};
SiteLanguageChangeButton.defaultProps = {
  small: false,
  textColor: '#000',
  backgroundColor: '#FFF',
  borderless: false,
};

export default SiteLanguageChangeButton;
