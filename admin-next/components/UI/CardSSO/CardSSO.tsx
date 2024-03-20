import type { FC } from 'react'
import { Flex, FlexProps } from '@cap-collectif/ui'
import CardSSOHeader from '@ui/CardSSO/header/CardSSOHeader'
import CardSSOBody from '@ui/CardSSO/body/CardSSOBody'

interface CardSSOProps extends FlexProps {}

type SubComponents = {
  Header: typeof CardSSOHeader
  Body: typeof CardSSOBody
}

const CardSSO: FC<CardSSOProps> & SubComponents = ({ children, ...props }) => (
  <Flex
    direction="column"
    border="normal"
    borderColor="gray.200"
    borderRadius="normal"
    overflow="hidden"
    width="100%"
    minWidth="264px"
    {...props}
  >
    {children}
  </Flex>
)

CardSSO.Header = CardSSOHeader
CardSSO.Body = CardSSOBody

export default CardSSO
