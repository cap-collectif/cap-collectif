// @flow

import * as React from 'react';
import type { FileRejection } from 'react-dropzone';
import { useIntl } from 'react-intl';
import Heading from '~ui/Primitives/Heading';
import Text from '~ui/Primitives/Text';
import { getError } from '~ui/Uploader/Uploader.utils';
import { ErrorList } from '~ui/Uploader/Uploader.styles';

export type Props = {|
  fileRejections: FileRejection[],
  maxSize: number,
  multiple?: boolean,
  acceptedFiles: File[],
|};
const Errors = ({ fileRejections, maxSize, acceptedFiles, multiple }: Props) => {
  const intl = useIntl();
  if (!fileRejections || fileRejections.length === 0) {
    return null;
  }
  return (
    <ErrorList>
      {multiple && (
        <Heading as="h5" color="red.900" fontWeight="semibold">
          {intl.formatMessage({ id: 'uploader.rejected.list.title' })}
        </Heading>
      )}
      {fileRejections &&
        fileRejections.map(rejected => {
          return (
            <Text
              color="red.900"
              fontSize={1}
              lineHeight="sm"
              fontWeight="normal"
              key={rejected.file.name}>
              {getError({
                fileRejection: [rejected],
                maxSize,
                intl,
                acceptedFiles,
                multiple,
              })}
            </Text>
          );
        })}
    </ErrorList>
  );
};
export default Errors;
