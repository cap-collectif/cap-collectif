import * as React from 'react'
import { Box, Flex, Skeleton, Spinner } from '@cap-collectif/ui'
import { pxToRem } from '@shared/utils/pxToRem'

const OrganizationPagePlaceholder = () => (
  <>
    <Flex as="section" id="organizationLoading" bg="white">
      <Flex
        maxWidth={pxToRem(1280)}
        width="100%"
        margin="auto"
        justify="space-between"
        bg="white"
        py={[0, 8]}
        px={[4, 6]}
        direction={['column-reverse', 'row']}
      >
        <Flex direction="column" maxWidth={pxToRem(550)} p={[4, 0]} width="100%">
          <Skeleton.Text height={8} width="90%" mb={8} />
          <div>
            <Skeleton.Text width="90%" height={4} mb={2} />
            <Skeleton.Text width="70%" height={4} mb={2} />
            <Skeleton.Text width="80%" height={4} mb={2} />
          </div>
        </Flex>
        <Box borderRadius="accordion" position="relative">
          <Skeleton.Text
            width={['100%', pxToRem(405)]}
            borderRadius={[0, 'accordion']}
            minHeight={['unset', pxToRem(270)]}
            maxHeight={pxToRem(315)}
          />
        </Box>
      </Flex>
    </Flex>
    <Spinner m="auto" my="10rem" />
  </>
)

export default OrganizationPagePlaceholder
