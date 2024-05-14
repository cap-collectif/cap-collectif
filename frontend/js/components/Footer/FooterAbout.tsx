import React from 'react'
import styled from 'styled-components'
import WYSIWYGRender from '../Form/WYSIWYGRender'
import type { SocialNetwork } from './Footer'
import { Box } from '@cap-collectif/ui'

type Props = {
  textTitle: string
  textBody: string
  socialNetworks?: Array<SocialNetwork>
  titleColor: string
  textColor: string
  backgroundColor: string
}
const About = styled.div<{
  backgroundColor: string
  textColor: string
}>`
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
`
const FooterTitle = styled.h2<{
  titleColor: string
}>`
  color: ${props => props.titleColor};
  margin-top: 0;
  font-size: 18px;
  margin-bottom: 10px;
`
const FooterBody = styled(WYSIWYGRender)`
  text-align: center;

  a {
    font-weight: bold;
    cursor: pointer;
    color: inherit;
  }
`
const SocialNetworks = styled.ul`
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
`

const FooterAbout = ({ textBody, textTitle, socialNetworks, titleColor, textColor, backgroundColor }: Props) => (
  <About backgroundColor={backgroundColor} textColor={textColor}>
    <Box maxWidth="960px" margin="auto">
      <Box px={4}>
        <FooterTitle titleColor={titleColor}>{textTitle}</FooterTitle>
        <FooterBody value={textBody} />
      </Box>
      <Box px={4}>
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
      </Box>
    </Box>
  </About>
)

export default FooterAbout
