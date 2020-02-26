// @flow
import React from 'react';
import { Row, Col } from 'react-bootstrap';
import styled, { type StyledComponent } from 'styled-components';
import WYSIWYGRender from '../Form/WYSIWYGRender';
import { type SocialNetwork } from './Footer';

type Props = {|
  textTitle: string,
  textBody: string,
  socialNetworks?: Array<SocialNetwork>,
  titleColor: string,
  textColor: string,
  backgroundColor: string,
|};

const About: StyledComponent<
  { backgroundColor: string, textColor: string },
  {},
  HTMLDivElement,
> = styled.div`
  padding: 30px 60px;
  margin: 0;
  width: 100%;
  background-color: ${props => props.backgroundColor};
  color: ${props => props.textColor};

  @media (max-width: 991px) {
    padding: 30px;
  }

  @media (max-width: 767px) {
    padding: 15px;
  }
`;

const ContainerRow: StyledComponent<{}, {}, typeof Row> = styled(Row)`
  margin: auto;
  max-width: 960px;
`;

const FooterTitle: StyledComponent<{ titleColor: string }, {}, HTMLHeadingElement> = styled.h2`
  color: ${props => props.titleColor};
  margin-top: 0;
  font-size: 18px;
  margin-bottom: 10px;
`;

const FooterBody: StyledComponent<{}, {}, typeof WYSIWYGRender> = styled(WYSIWYGRender)`
  text-align: center;

  a {
    font-weight: bold;
    cursor: pointer;
    color: inherit;
  }
`;

const SocialNetworks: StyledComponent<{}, {}, HTMLUListElement> = styled.ul`
  text-align: center;
  list-style: none;
  margin: 0;
  padding: 0;
  li {
    display: inline-block;
    padding-left: 15px;
    margin-top: 15px;

    &:first-child {
      padding-left: 0;
    }

    & a {
      color: inherit;
    }
  }
`;

const FooterAbout = ({
  textBody,
  textTitle,
  socialNetworks,
  titleColor,
  textColor,
  backgroundColor,
}: Props) => (
  <About backgroundColor={backgroundColor} textColor={textColor}>
    <ContainerRow>
      <Col xs={12} sm={12} md={12} lg={12}>
        <FooterTitle titleColor={titleColor}>{textTitle}</FooterTitle>
        <FooterBody value={textBody} />
      </Col>
      <Col xs={12} sm={12} md={10} lg={8} lgOffset={2} mdOffset={1}>
        <SocialNetworks>
          {socialNetworks &&
            socialNetworks.map(socialNetwork => (
              <li key={socialNetwork.title}>
                <span className={`cap cap-${socialNetwork.style}`} />
                <a href={socialNetwork.link} className="external-link">
                  <span>{` ${socialNetwork.title}`}</span>
                </a>
              </li>
            ))}
        </SocialNetworks>
      </Col>
    </ContainerRow>
  </About>
);

export default FooterAbout;
