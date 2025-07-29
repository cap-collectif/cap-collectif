import * as React from 'react'
import { Flex, FlexProps } from '@cap-collectif/ui'
import CardOrgHeader from '@ui/CardOrg/header/CardOrgHeader'
import CardOrgBody from '@ui/CardOrg/body/CardOrgBody'

interface CardOrgProps extends FlexProps {}

type SubComponents = {
  Header: typeof CardOrgHeader
  Body: typeof CardOrgBody
}

const CardOrg: React.FC<CardOrgProps> & SubComponents = ({ children, ...props }) => (
  <Flex
    direction="column"
    border="normal"
    borderColor="gray.200"
    backgroundColor="white"
    borderRadius="normal"
    overflow="hidden"
    padding={0}
    width="226px"
    height="172px"
    {...props}
  >
    {children}
  </Flex>
)
CardOrg.Header = CardOrgHeader
CardOrg.Body = CardOrgBody

export default CardOrg
