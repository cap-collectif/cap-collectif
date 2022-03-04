// @flow
import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import styled, { type StyledComponent } from 'styled-components';
import SiteLanguageChangeButton, { type LocaleMap } from '../Button/SiteLanguageChangeButton';
import type { LocaleChoiceTranslation } from '~/components/Navbar/LanguageHeader';

type Props = {|
  +localeChoiceTranslations: Array<LocaleChoiceTranslation>,
  onChange: LocaleMap => void,
  onClose: () => void,
  languageList: Array<LocaleMap>,
  defaultLanguage: string,
|};

const ChangeLanguageProposalContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  font-family: 'OpenSans', helvetica, arial, sans-serif;
  font-size: 16px;
  width: 100%;
  background: #444;
  min-height: 75px;
  color: #fff;
  display: flex;
  justify-content: space-between;
  @media (max-width: 991px) {
    padding: 20px 15px;
  }

  align-items: center;
  transition: all 0.3s ease;
  position: relative;
  padding: 0;
  #language-header-close {
    position: absolute;
    top: 30px;
    right: 30px;
  }
`;

export const Content: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  align-items: center;

  @media (max-width: 991px) {
    flex-direction: column;
  }
`;

const Close: StyledComponent<{}, {}, HTMLElement> = styled.i`
  margin-left: 35px;
  margin-top: 2px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.5);

  @media (max-width: 991px) {
    margin-left: -15px;
    margin-top: -50px;
  }
`;

const ChangeLanguageForm: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  width: 50%;
  text-align: end;

  .dropdown {
    width: 65%;
  }

  @media (max-width: 991px) {
    width: 100%;
    text-align: start;
    justify-content: space-between;
    display: flex;
    margin-top: 10px;
  }
`;

const ContinueButton: StyledComponent<{}, {}, typeof Button> = styled(Button)`
  font-size: 16px;
  margin-left: 20px;

  @media (max-width: 991px) {
    margin-left: 10px;
  }
`;

const ChangeLanguageText: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  @media (max-width: 991px) {
    align-self: start;
    max-width: 85%;
  }

  padding-left: 15px;
`;

const disappearTransition = () => {
  const container = document.getElementById('changeLanguageProposalContainer');
  if (container) {
    container.style.minHeight = '0';
    container.style.height = '0';
    container.style.overflowY = 'hidden';
    container.style.paddingTop = '0';
    container.style.paddingBottom = '0';
  }
};

const ChangeLanguageOnWebsiteHeader = React.forwardRef<Props, HTMLDivElement>(
  (
    { onChange, onClose, languageList, defaultLanguage, localeChoiceTranslations }: Props,
    ref: any,
  ) => {
    const [currentLanguage, updateLanguage] = useState(
      languageList.find(e => e.code === defaultLanguage),
    );

    if (!currentLanguage) return null;
    const localChoiceTrans = localeChoiceTranslations.find(
      localeChoice => localeChoice.code === currentLanguage.code,
    );

    return (
      <ChangeLanguageProposalContainer ref={ref} id="changeLanguageProposalContainer">
        <div className="container">
          <Content>
            <ChangeLanguageText>
              <span>{localChoiceTrans && localChoiceTrans.message}</span>
            </ChangeLanguageText>
            <ChangeLanguageForm>
              <SiteLanguageChangeButton
                id="language-header-change-button"
                languageList={languageList}
                defaultLanguage={defaultLanguage}
                onChange={updateLanguage}
                backgroundColor="rgba(255, 255, 255, 0.15) !important" // TODO: Remove this when we'll stop using bootstrap
                textColor="#FFF"
              />
              <ContinueButton
                id="language-header-continue-button"
                bsStyle="primary"
                onClick={() => onChange(currentLanguage)}>
                <span>{localChoiceTrans && localChoiceTrans.label}</span>
              </ContinueButton>
            </ChangeLanguageForm>
          </Content>
        </div>
        <Close
          id="language-header-close"
          className="cap-delete-1"
          onClick={() => {
            disappearTransition();
            onClose();
          }}
        />
      </ChangeLanguageProposalContainer>
    );
  },
);

export default ChangeLanguageOnWebsiteHeader;
