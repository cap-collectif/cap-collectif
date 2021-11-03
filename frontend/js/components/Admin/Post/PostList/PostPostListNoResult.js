// @flow
import * as React from 'react';
import { useIntl } from 'react-intl';
import SpotIcon, { SPOT_ICON_NAME } from '~ds/SpotIcon/SpotIcon';
import Heading from '~ui/Primitives/Heading';
import Flex from '~ui/Primitives/Layout/Flex';
import Text from '~ui/Primitives/Text';
import Button from '~ds/Button/Button';

const PostPostListNoResult = (): React.Node => {
  const intl = useIntl();

  return (
    <Flex
      direction="row"
      spacing={8}
      bg="white"
      py="96px"
      px="111px"
      mt={6}
      mx={6}
      borderRadius="normal">
      <SpotIcon name={SPOT_ICON_NAME.NEWSPAPER} size="lg" />

      <Flex direction="column" color="blue.900" align="flex-start" width="300px">
        <Heading as="h3" mb={2}>
          {intl.formatMessage({ id: 'admin.post.noresult.heading' })}
        </Heading>
        <Text mb={8}>{intl.formatMessage({ id: 'admin.post.noresult.body' })}</Text>

        <Button
          variant="primary"
          variantColor="primary"
          variantSize="big"
          leftIcon="ADD"
          onClick={() => window.open('/admin/capco/app/post/create', '_self')}>
          {intl.formatMessage({ id: 'admin-create-post' })}
        </Button>
      </Flex>
    </Flex>
  );
};

export default PostPostListNoResult;
