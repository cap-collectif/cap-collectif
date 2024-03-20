import * as React from 'react'
import { useIntl } from 'react-intl'
import { Button, CapUIIcon, CapUISpotIcon, CapUISpotIconSize, Flex, Heading, SpotIcon, Text } from '@cap-collectif/ui'

const PostListNoResult: React.FC = () => {
  const intl = useIntl()

  return (
    <Flex direction="row" spacing={8} bg="white" py="96px" px="111px" mt={6} mx={6} borderRadius="normal">
      <SpotIcon name={CapUISpotIcon.NEWSPAPER} size={CapUISpotIconSize.Lg} />

      <Flex direction="column" color="blue.900" align="flex-start" width="300px">
        <Heading as="h3" mb={2}>
          {intl.formatMessage({ id: 'admin.post.noresult.heading' })}
        </Heading>
        <Text mb={8}>{intl.formatMessage({ id: 'admin.post.noresult.body' })}</Text>

        <Button
          variant="primary"
          variantColor="primary"
          variantSize="big"
          leftIcon={CapUIIcon.Add}
          onClick={() => window.open('/admin/capco/app/post/create', '_self')}
        >
          {intl.formatMessage({ id: 'admin-create-post' })}
        </Button>
      </Flex>
    </Flex>
  )
}

export default PostListNoResult
