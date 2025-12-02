import { Flex, FlexProps } from '@cap-collectif/ui'
import { FC } from 'react'

export const VoteStepMapPlaceholder: FC<FlexProps> = ({ children, ...rest }) => {
  return (
    <Flex
      borderRadius="xs"
      height="100%"
      sx={{ background: 'url(/map_placeholder.jpg)', backgroundSize: 'cover' }}
      alignItems="center"
      justifyContent="center"
      {...rest}
    >
      {children}
    </Flex>
  )
}

export default VoteStepMapPlaceholder
