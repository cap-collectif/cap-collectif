import { FC, useMemo, useState } from 'react'
import { useIntl } from 'react-intl'
import { Box, Flex, FlexProps } from '@cap-collectif/ui'
import Label from '../Label/Label'

type Percentage = {
  readonly id: string
  readonly percentage: number
}

type Traffic = {
  readonly id: string
  readonly color: string
  readonly label: string
  readonly percentage: number
}

export interface TrafficChartProps extends FlexProps {
  percentages: Percentage[]
}

const traffics: Traffic[] = [
  { id: 'SEARCH_ENGINE', label: 'search-engine', color: 'blue.800', percentage: 0 },
  { id: 'DIRECT', label: 'direct-entries', color: 'blue.500', percentage: 0 },
  { id: 'EXTERNAL_LINK', label: 'external-links', color: 'green.500', percentage: 0 },
  { id: 'SOCIAL_NETWORK', label: 'social-medias', color: 'orange.500', percentage: 0 },
  { id: 'EMAIL', label: 'share.mail', color: 'red.500', percentage: 0 },
]

const TrafficChart: FC<TrafficChartProps> = ({ percentages, ...props }) => {
  const [hovered, setHovered] = useState<string | null>(null)
  const intl = useIntl()
  const trafficsFormatted: Traffic[] = useMemo(
    () =>
      traffics
        .map(traffic => ({
          ...traffic,
          percentage: percentages.find(percentage => percentage.id === traffic.id)?.percentage || traffic.percentage,
        }))
        .filter(traffic => traffic.percentage > 0)
        .sort((t1, t2) => (t1.percentage > t2.percentage ? -1 : 1)),
    [percentages],
  )

  return (
    <Flex direction="column" spacing={7} {...props}>
      <Flex direction="row" justify="space-between" wrap="wrap" align="flex-start">
        {trafficsFormatted.map((traffic, i) => (
          <Label
            key={traffic.id}
            circleColor={traffic.color}
            state={hovered === null || hovered === traffic.id ? 'idle' : 'hidden'}
            onMouseOver={() => setHovered(traffic.id)}
            onMouseOut={() => setHovered(null)}
            width="48%"
            mb={i === trafficsFormatted.length - 1 ? 0 : 3}
          >
            {`${intl.formatMessage({ id: traffic.label })} (${traffic.percentage}%)`}
          </Label>
        ))}
      </Flex>

      <Flex direction="row">
        {trafficsFormatted.map((traffic, j) => (
          <Box
            key={traffic.id}
            bg={traffic.color}
            flex={traffic.percentage}
            height={7}
            borderTopLeftRadius={j === 0 ? 'normal' : 'initial'}
            borderBottomLeftRadius={j === 0 ? 'normal' : 'initial'}
            borderTopRightRadius={j === trafficsFormatted.length - 1 ? 'normal' : 'initial'}
            borderBottomRightRadius={j === trafficsFormatted.length - 1 ? 'normal' : 'initial'}
            onMouseOver={() => setHovered(traffic.id)}
            onMouseOut={() => setHovered(null)}
            opacity={hovered === null || hovered === traffic.id ? 1 : 0.2}
          />
        ))}
      </Flex>
    </Flex>
  )
}

export default TrafficChart
