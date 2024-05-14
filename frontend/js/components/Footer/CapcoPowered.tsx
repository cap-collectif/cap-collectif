import React from 'react'
import styled from 'styled-components'
import { useIntl } from 'react-intl'
import { Flex } from '@cap-collectif/ui'

type Props = {
  textColor: string
}

const CapcoLogo = styled.img`
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
    <Flex alignItems="center" justifyContent="center">
      {intl.formatMessage({ id: 'powered_by' })}
      <CapcoLogo src="/favicon-64x64.png" alt="cap collectif logo" />
      <CapcoLink textColor={textColor} href="https://cap-collectif.com">
        <span>Cap Collectif</span>
      </CapcoLink>
    </Flex>
  )
}

export default CapcoPowered
