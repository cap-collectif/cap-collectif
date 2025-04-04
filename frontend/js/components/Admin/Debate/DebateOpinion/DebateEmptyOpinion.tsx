import * as React from 'react'
import { FormattedMessage } from 'react-intl'
import Flex from '~ui/Primitives/Layout/Flex'
import Icon, { ICON_NAME, ICON_SIZE } from '~ds/Icon/Icon'
import type { ForOrAgainstValue } from '~relay/FaceToFace_debate.graphql'
import '~relay/FaceToFace_debate.graphql'
import { Tag } from '@cap-collectif/ui'

type Props = {
  type: ForOrAgainstValue
}

const DebateEmptyOpinion = ({ type }: Props) => (
  <Flex
    direction="column"
    border="1px dashed"
    borderColor="gray.300"
    align="center"
    p={5}
    flex="1"
    borderRadius="normal"
    position="relative"
  >
    <Tag
      variantColor={type === 'FOR' ? 'green' : 'red'}
      sx={{ position: 'absolute !important' }}
      top="-1px"
      left="-1px"
      borderBottomLeftRadius={0}
      borderTopRightRadius={0}
    >
      <FormattedMessage id={type === 'FOR' ? 'opinion.for' : 'opinion.against'} />
    </Tag>
    <Icon name={ICON_NAME.ADD} size={ICON_SIZE.XL} color="gray.300" />
  </Flex>
)

export default DebateEmptyOpinion
