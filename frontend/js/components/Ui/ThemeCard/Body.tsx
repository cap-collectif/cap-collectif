import * as React from 'react'
import type { StyledComponent } from 'styled-components'
import styled from 'styled-components'
import { FormattedMessage } from 'react-intl'
import type { ThemeProps } from './ThemeCard'
import './ThemeCard'
import InlineList from '../List/InlineList'
import { mediaQueryMobile } from '~/utils/sizes'

type Props = ThemeProps
const InfosContainer: StyledComponent<any, {}, HTMLDivElement> = styled.div`
  background-color: white;
  padding: 10px;
  line-height: 27px;

  @media (max-width: ${mediaQueryMobile.maxWidth}) {
    width: 100%;
  }
`
const Title: StyledComponent<any, {}, HTMLHeadingElement> = styled.h2`
  font-size: 30px;
  text-align: center;
  margin: 5px;

  @media (max-width: ${mediaQueryMobile.maxWidth}) {
    margin: auto;
  }
`
const Infos: StyledComponent<any, {}, HTMLSpanElement> = styled.span`
  font-size: 20px;
  color: grey;
  text-align: center;

  @media (max-width: ${mediaQueryMobile.maxWidth}) {
    margin: auto;
  }
`

const isDisplay = (projectsMetrics, articlesMetrics, eventsMetrics) =>
  projectsMetrics > 0 || articlesMetrics > 0 || eventsMetrics > 0

export const Body = ({ title, url, projectsMetrics = 0, articlesMetrics = 0, eventsMetrics = 0 }: Props) => {
  return (
    <InfosContainer>
      <Title>
        <a href={url}>{title}</a>
      </Title>

      <Infos>
        {isDisplay(projectsMetrics, eventsMetrics, articlesMetrics) && (
          <InlineList separator="•">
            {projectsMetrics > 0 && (
              <li>
                <FormattedMessage
                  id="number-of-project"
                  values={{
                    num: projectsMetrics,
                  }}
                />
              </li>
            )}
            {articlesMetrics > 0 && (
              <li>
                <FormattedMessage
                  id="number-of-articles"
                  values={{
                    num: articlesMetrics,
                  }}
                />
              </li>
            )}
            {eventsMetrics > 0 && (
              <li>
                <FormattedMessage
                  id="number-of-events"
                  values={{
                    num: eventsMetrics,
                  }}
                />
              </li>
            )}
          </InlineList>
        )}
      </Infos>
    </InfosContainer>
  )
}
export default Body
