import { Box, Button, CapUIFontSize, CapUIIcon, CapUIIconSize, CapUILineHeight, Icon } from '@cap-collectif/ui'
import { MouseEventHandler, ReactNode } from 'react'

interface Props {
  children: ReactNode
  icon: CapUIIcon
  onClick?: MouseEventHandler<any>
}

const StepVoteMobileActionBtn: React.FC<Props> = ({ children, icon, onClick }) => {
  return (
    <Button variant="tertiary" flexDirection="column" flex="1 0 0" onClick={onClick}>
      <Icon name={icon} size={CapUIIconSize.Md} />
      <Box as="span" fontSize={CapUIFontSize.BodySmall} lineHeight={CapUILineHeight.S}>
        {children}
      </Box>
    </Button>
  )
}

export default StepVoteMobileActionBtn
