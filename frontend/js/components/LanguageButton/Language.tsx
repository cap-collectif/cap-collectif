import React from 'react'
import { useIntl } from 'react-intl'
import type { StyledComponent } from 'styled-components'
import styled from 'styled-components'
import { createFragmentContainer, graphql } from 'react-relay'
import type { Language_language } from '~relay/Language_language.graphql'

type Props = {
  language: Language_language
}

/*
Keep this for future specs 

const Dot: StyledComponent<{ green: boolean }, {}, HTMLDivElement> = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 10px;
  background-color: ${props => (props.green ? '#088a20' : '#dc3545')};
  align-self: center;
  margin-right: 10px;
`;
*/
export const LanguageTitle: StyledComponent<any, {}, HTMLDivElement> = styled.div`
  font-family: 'OpenSans', helvetica, arial, sans-serif;
  font-size: 16px;
  color: #000;
`
export const LanguageContainer: StyledComponent<any, {}, HTMLDivElement> = styled.div`
  display: flex;
`
export const Language = ({ language }: Props) => {
  const intl = useIntl()
  return (
    <LanguageContainer>
      {/* <Dot green={language.translated} /> */}
      <LanguageTitle>
        {intl.formatMessage({
          id: language.name,
        })}
      </LanguageTitle>
    </LanguageContainer>
  )
}
export default createFragmentContainer(Language, {
  language: graphql`
    fragment Language_language on Locale {
      name: traductionKey
      translated: isPublished
    }
  `,
})
