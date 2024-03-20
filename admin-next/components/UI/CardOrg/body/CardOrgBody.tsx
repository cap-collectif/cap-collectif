import * as React from 'react'
import { Flex, FlexProps } from '@cap-collectif/ui'

interface CardOrgBodyProps extends FlexProps {}

const CardOrgBody: React.FC<CardOrgBodyProps> = ({ children, ...props }) => (
  <Flex width="100%" direction="row" p={6} justify="space-between" align="center" {...props}>
    {children}
  </Flex>
)

export default CardOrgBody
