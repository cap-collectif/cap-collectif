import { Box, BoxProps, Flex } from '@cap-collectif/ui'
import { hexToRgb } from '@shared/utils/colors'
import { pxToRem } from '@shared/utils/pxToRem'
import { FC } from 'react'

export const Progress: FC<BoxProps & { progress: number; mainColor: string }> = ({ progress, mainColor, ...rest }) => {
  const RGBPrimary = hexToRgb(mainColor)
  return (
    <Flex
      className="frise__stepItem__progressbar"
      direction="row"
      width={pxToRem(232)}
      height={1}
      position="absolute"
      bottom={0}
      backgroundColor={`rgba(${RGBPrimary.r},${RGBPrimary.g},${RGBPrimary.b},0.47)`}
      marginLeft="2px"
      style={{
        transform: 'skew(328deg,0)',
      }}
      {...rest}
    >
      <Box
        className="frise__stepItem__progress"
        width={`${progress}%`}
        height={1}
        borderRadius="0px 50px 50px 0px"
        backgroundColor={mainColor}
      />
    </Flex>
  )
}
