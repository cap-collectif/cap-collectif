import { Flex, Skeleton } from '@cap-collectif/ui'

const TrafficChartPlaceholder = () => (
  <Flex direction="column" justify="space-between">
    <Flex direction="row" justify="space-between" wrap="wrap" mb={7}>
      <Skeleton.Text size="md" width="45%" mb={3} />
      <Skeleton.Text size="md" width="45%" mb={3} />
      <Skeleton.Text size="md" width="45%" mb={3} />
      <Skeleton.Text size="md" width="45%" mb={3} />
      <Skeleton.Text size="md" width="45%" mb={3} />
    </Flex>

    <Skeleton.Text size="lg" width="100%" />
  </Flex>
)

export default TrafficChartPlaceholder
