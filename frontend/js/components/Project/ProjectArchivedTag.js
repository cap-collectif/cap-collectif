// @flow
import * as React from 'react';
import { useIntl } from 'react-intl';
import { ICON_NAME } from '~ds/Icon/Icon';
import Tag from '~ds/Tag/Tag';
import Text from '~ui/Primitives/Text';
import AppBox from '~ui/Primitives/AppBox';

const ProjectArchivedTag = () => {
  const intl = useIntl();
  return (
    <AppBox position="absolute" top="12px" right="10px">
      <Tag
        id="archived-tag"
        icon={ICON_NAME.FOLDER_O}
        variant="neutral-gray"
        color="neutral-gray.500">
        <Text color="neutral-gray.800" fontWeight={600}>
          {intl.formatMessage({ id: 'global-archived' })}
        </Text>
      </Tag>
    </AppBox>
  );
};

export default ProjectArchivedTag;
