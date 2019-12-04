// @flow
import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import styled, { type StyledComponent } from 'styled-components';
import { FormattedMessage } from 'react-intl';
import SiteLanguageChangeButton from '../Button/SiteLanguageChangeButton';

type Props = {|
  onChange: string => void,
  onClose: () => void,
  languageList: Array<string>,
  defaultLanguage: string,
|};

const ChangeLanguageProposalContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  font-family: 'OpenSans', helvetica, arial, sans-serif;
  font-size: 16px;
  width: 100%;
  background: #444444;
  min-height: 75px;
  color: #fff;
  display: flex;
  justify-content: space-between;
  padding: 20px 45px;
  @media (max-width: 991px) {
    padding: 20px 15px;
  }
  align-items: center;
  transition: all 0.3s ease;
`;

const Content: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
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

  @media (max-width: 991px) {
    width: 100%;
    text-align: start;
    justify-content: space-between;
    display: flex;
    margin-top: 10px;
  }
  .dropdown {
    width: 65%;
  }
`;

const ContinueButton: StyledComponent<{}, {}, Button> = styled(Button)`
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

const ChangeLanguageOnWebsiteHeader = ({
  onChange,
  onClose,
  languageList,
  defaultLanguage,
}: Props) => {
  const [currentLanguage, updateLanguage] = useState(languageList.find(e => e === defaultLanguage));
  if (!currentLanguage) return null;
  return (
    <ChangeLanguageProposalContainer id="changeLanguageProposalContainer">
      <Content>
        <ChangeLanguageText>
          <FormattedMessage id="would-you-like-to-consult-the-site-in-your-own-language" />
        </ChangeLanguageText>
        <ChangeLanguageForm>
          <SiteLanguageChangeButton
            languageList={languageList}
            defaultLanguage={defaultLanguage}
            onChange={updateLanguage}
            backgroundColor="rgba(255, 255, 255, 0.15) !important" // TODO: Remove this when we'll stop using bootstrap
            textColor="#FFF"
            pullRight
          />
          <ContinueButton bsStyle="primary" onClick={() => onChange(currentLanguage)}>
            <FormattedMessage id="global.continue" />
          </ContinueButton>
        </ChangeLanguageForm>
      </Content>
      <Close
        className="cap-delete-1"
        onClick={() => {
          disappearTransition();
          onClose();
        }}
      />
    </ChangeLanguageProposalContainer>
  );
};

export default ChangeLanguageOnWebsiteHeader;
