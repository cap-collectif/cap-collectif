import { ButtonQuickAction, ButtonQuickActionProps, CapUIIcon, useTheme } from '@cap-collectif/ui'
import { pxToRem } from '@shared/utils/pxToRem'
import React from 'react'
import { FC } from 'react'

export type Mode = 'inside' | 'below'

const CarrouselButton: FC<ButtonQuickActionProps & { mode?: Mode }> = ({ mode = 'below', ...props }) => {
  const { colors } = useTheme()
  return (
    <ButtonQuickAction
      type="button"
      backgroundColor={[
        `${colors['neutral-gray'][150]} !important`,
        mode === 'below' ? 'white !important' : 'rgba(0, 0, 0, 0.65) !important',
      ]}
      variantColor="neutral-gray"
      icon={CapUIIcon.ArrowLeft}
      p={pxToRem(10)}
      sx={{ svg: { color: ['neutral-gray.700', mode === 'below' ? 'neutral-gray.900' : 'white'] } }}
      boxShadow={['', 'small']}
      {...props}
    />
  )
}

export default CarrouselButton
