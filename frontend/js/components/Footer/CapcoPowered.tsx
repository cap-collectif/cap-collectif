import React from 'react'
import type { StyledComponent } from 'styled-components'
import styled from 'styled-components'
import { useIntl } from 'react-intl'

type Props = {
  textColor: string
}
const CapcoPoweredContainer: StyledComponent<any, {}, HTMLDivElement> = styled.div`
  text-align: center;
  width: 100%;
`
const CapcoLogo: StyledComponent<any, {}, HTMLImageElement> = styled.img`
  width: 20px;
  height: 20px;
  margin: 0 5px;
`
const CapcoLink = styled.a<{
  textColor: string
}>`
  font-weight: bold;
  color: ${props => props.textColor};
  &:hover {
    color: ${props => props.textColor};
  }
`

const CapcoPowered = ({ textColor }: Props): JSX.Element => {
  const intl = useIntl()
  return (
    <CapcoPoweredContainer>
      {intl.formatMessage({ id: 'powered_by' })}
      <CapcoLogo src="/favicon-64x64.png" alt="cap collectif logo" />
      <CapcoLink textColor={textColor} href="https://cap-collectif.com">
        <span>Cap Collectif</span>
      </CapcoLink>
    </CapcoPoweredContainer>
  )
}

export default CapcoPowered
