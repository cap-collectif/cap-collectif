import * as React from 'react'
import { useIntl } from 'react-intl'
import { Flex, Icon, CapUIIcon, CapUIIconSize, Tag, Text } from '@cap-collectif/ui'
import { ForOrAgainstValue } from '@relay/FaceToFace_debate.graphql'
import { SystemStyleObject } from '@styled-system/css'

type Props = {
  type: ForOrAgainstValue
}

const DebateEmptyOpinion = ({ type }: Props) => {
  const intl = useIntl()
  return (
    <Flex
      direction="column"
      border="1px dashed"
      borderColor="gray.300"
      align="center"
      p={5}
      flex="1"
      borderRadius="normal"
      position="relative"
      bg="white"
    >
      <Tag
        variantColor={type === 'FOR' ? 'green' : 'red'}
        sx={{
          position: 'absolute !important' as SystemStyleObject,
        }}
        top="0"
        left="0"
        borderBottomLeftRadius={0}
        borderTopRightRadius={0}
      >
        <Text fontWeight={600}>
          {intl.formatMessage({ id: type === 'FOR' ? 'opinion.for' : 'opinion.against' }).toUpperCase()}
        </Text>
      </Tag>
      <Icon name={CapUIIcon.Add} size={CapUIIconSize.Xl} color="gray.300" />
    </Flex>
  )
}

export default DebateEmptyOpinion
