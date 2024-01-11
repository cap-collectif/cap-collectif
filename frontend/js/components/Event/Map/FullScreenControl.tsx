import * as React from 'react'
import LeafletControl from '~/components/VoteStep/Map/LeafletControl'
import Icon from '~ds/Icon/Icon'
import Flex from '~ui/Primitives/Layout/Flex'

const FullScreenControl = ({ onClick }: { onClick: () => void }) => (
  <LeafletControl position="topleft" className="below">
    <Flex
      borderRadius="normal"
      as="button"
      bg="white"
      align="center"
      justifyContent="center"
      borderColor="rgba(0,0,0,.3)"
      borderStyle="solid"
      onClick={onClick}
      p="3px"
    >
      <Icon name="EXPAND" size="md" color="gray.900" p="3px !important" />
    </Flex>
  </LeafletControl>
)

export default FullScreenControl
