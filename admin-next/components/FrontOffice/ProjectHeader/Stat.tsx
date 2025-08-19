import { Box, CapUIFontSize, CapUILineHeight, Flex, Tooltip } from '@cap-collectif/ui'
import { formatBigNumber } from '@utils/format-number'

import { FC } from 'react'

type StatProps = { entity: string; count: number | string; tooltipLabel?: React.ReactNode }

export const Stat: FC<StatProps> = ({ entity, count, tooltipLabel }) => {
  const renderContent = () => (
    <Flex
      className="cap-project-stat"
      as={tooltipLabel ? 'button' : 'div'}
      direction="column"
      justify="flex-start"
      alignItems="start"
      sx={{ cursor: tooltipLabel ? 'help' : 'default' }}
    >
      <Box
        fontSize={[CapUIFontSize.BodySmall, CapUIFontSize.Headline]}
        lineHeight={CapUILineHeight.M}
        fontWeight="semibold"
      >
        {typeof count === 'number' ? formatBigNumber(count) : count}
      </Box>
      <Box
        fontSize={[CapUIFontSize.Caption, CapUIFontSize.Headline]}
        lineHeight={CapUILineHeight.M}
        fontWeight="normal"
      >
        {entity.charAt(0).toUpperCase() + entity.slice(1)}
      </Box>
    </Flex>
  )

  if (tooltipLabel) return <Tooltip label={tooltipLabel}>{renderContent()}</Tooltip>

  return renderContent()
}

export default Stat
