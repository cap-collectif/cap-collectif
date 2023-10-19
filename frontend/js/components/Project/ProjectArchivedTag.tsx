import * as React from 'react'
import { useIntl } from 'react-intl'
import { Box, Tag, Text, CapUIIcon, Flex, Icon } from '@cap-collectif/ui'

const ProjectArchivedTag = () => {
  const intl = useIntl()
  return (
    <Box position="absolute" top="12px" right="10px">
      <Tag id="archived-tag" variantColor="neutral-gray" color="neutral-gray.500" as="Flex">
        <Flex>
          <Icon name={CapUIIcon.FolderO} />
          <Text color="neutral-gray.800" fontWeight={600}>
            {intl.formatMessage({
              id: 'global-archived',
            })}
          </Text>
        </Flex>
      </Tag>
    </Box>
  )
}

export default ProjectArchivedTag
