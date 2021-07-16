// @flow
import { type IntlShape } from 'react-intl';
import { type FileRejection } from 'react-dropzone';
import fileSizeConvert from '~/utils/fileSizeConvert';

const ERROR_TYPE = {
  INVALID_TYPE: 'download-error-file-format',
  INVALID_TYPE_MULTIPLE: 'download-error-file-formats',
  MAX_WEIGHT_MULTIPLE: 'error-download-file-sizes',
  MAX_WEIGHT: 'error-download-file-size',
  TIMEOUT: 'error-download-timeout',
};
export type Props = {|
  fileRejection: FileRejection[],
  maxSize: number,
  intl: IntlShape,
  acceptedFiles: File[],
  multiple?: boolean,
|};
export const getError = ({ fileRejection, maxSize, intl, acceptedFiles, multiple }: Props) => {
  const mainError = fileRejection[0].errors[0];
  const fileName = fileRejection[0].file.name;
  const fileExtension = fileRejection[0].file.type.split('/')[1];
  if (maxSize && mainError.code === 'file-too-large') {
    if (multiple) {
      return intl.formatMessage(
        { id: ERROR_TYPE.MAX_WEIGHT_MULTIPLE },
        {
          filePath: fileName,
          fileSize: fileSizeConvert.btomg(fileRejection[0].file.size),
        },
      );
    }
    return intl.formatMessage(
      { id: ERROR_TYPE.MAX_WEIGHT },
      {
        filePath: fileName,
        fileSize: fileSizeConvert.btomg(fileRejection[0].file.size),
      },
    );
  }

  if (acceptedFiles && mainError.code === 'file-invalid-type') {
    if (multiple) {
      return intl.formatMessage(
        { id: ERROR_TYPE.INVALID_TYPE_MULTIPLE },
        { fileName, fileType: fileExtension },
      );
    }
    return intl.formatMessage(
      { id: ERROR_TYPE.INVALID_TYPE },
      { fileName, fileType: fileExtension },
    );
  }
};
