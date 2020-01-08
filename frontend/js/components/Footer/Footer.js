// @flow
import React from 'react';
import styled, { type StyledComponent } from 'styled-components';
import { connect } from 'react-redux';
import colors from '../../utils/colors';
import type { GlobalState, FeatureToggles } from '../../types';
import FooterAbout from './FooterAbout';
import FooterLinks from './FooterLinks';

export type SocialNetwork = {|
  link: string,
  media: string,
  title: string,
  style: string,
|};

export type FooterLink = {|
  name: string,
  url: string,
|};

export type Legals = {|
  cookies: boolean,
  legal: boolean,
  privacy: boolean,
|};

type Props = {|
  textTitle: string,
  textBody: string,
  socialNetworks?: Array<SocialNetwork>,
  links?: Array<FooterLink>,
  legals: Legals,
  cookiesText: string,
  titleColor: string,
  textColor: string,
  backgroundColor: string,
  linksBackgroundColor: string,
  linksTextColor: string,
  features: FeatureToggles,
  cookiesPath: string,
  privacyPath: string,
  legalPath: string,
|};

const FooterContainer: StyledComponent<{ noCookies: boolean }, {}, HTMLElement> = styled.footer`
  text-align: center;
  border-top: 1px solid ${colors.borderColor};
  margin-bottom: ${props => props.noCookies && '100px'};
`;

export const Footer = ({
  textBody,
  textTitle,
  socialNetworks,
  links,
  legals,
  cookiesText,
  titleColor,
  textColor,
  backgroundColor,
  linksBackgroundColor,
  linksTextColor,
  features,
  cookiesPath,
  privacyPath,
  legalPath,
}: Props) => (
  <FooterContainer
    role="contentinfo"
    noCookies={cookiesText && !document.cookie.includes('hasFullConsent')}>
    <FooterAbout
      textColor={textColor}
      backgroundColor={backgroundColor}
      textBody={textBody}
      textTitle={textTitle}
      socialNetworks={socialNetworks}
      titleColor={titleColor}
    />
    <FooterLinks
      textColor={linksTextColor}
      backgroundColor={linksBackgroundColor}
      links={links}
      legals={legals}
      cookiesText={cookiesText}
      cookiesPath={cookiesPath}
      privacyPath={privacyPath}
      legalPath={legalPath}
      multilingual={features.unstable__multilangue || false}
    />
  </FooterContainer>
);

const mapStateToProps = (state: GlobalState) => ({
  features: state.default.features,
});

export default connect(mapStateToProps)(Footer);
