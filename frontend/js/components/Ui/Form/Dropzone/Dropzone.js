// @flow
import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import ReactDropzone from 'react-dropzone';
import DropzoneContainer from './Dropzone.style';
import Fetcher, { json } from '~/services/Fetcher';
import { type FileInfo } from '~/components/Ui/File/File';
import FakeLoaderBar from '~ui/FakeLoaderBar/FakeLoaderBar';

export const TIMEOUT_LOADER_DISPLAY = 2000;

type Errors = {
  [string]: Array<string>,
};

type Props = {
  onChange: Function,
  setError: (Array<string>) => void,
  errors: Errors,
  accept?: Array<string>,
  value: Array<FileInfo> | null,
  multiple?: boolean,
  disabled?: boolean,
  minSize?: number,
  maxSize?: number,
  maxFile?: number,
};

const Dropzone = ({
  onChange,
  setError,
  errors,
  value,
  accept,
  minSize,
  maxSize,
  maxFile,
  multiple = false,
  disabled = false,
}: Props) => {
  const [isLoading, setLoading] = useState<boolean>(false);
  // isLoaderDisplay -> used to see loading complete
  const [isLoaderDisplay, setLoaderDisplay] = useState<boolean>(false);

  const onDrop = async (acceptedFiles: Array<File>, filesAlreadyUploaded) => {
    if (
      maxFile &&
      filesAlreadyUploaded &&
      acceptedFiles &&
      acceptedFiles.length + filesAlreadyUploaded.length > maxFile
    ) {
      return setError(errors.MAX_FILE);
    }

    setError([]);
    setLoading(true);
    setLoaderDisplay(true);

    const promisesUpload = acceptedFiles.map(file => {
      const formData = new FormData();
      formData.append('file', file);

      return Fetcher.postFormData('/files', formData)
        .then(json)
        .then(res => ({
          id: res.id,
          name: res.name,
          size: res.size,
          url: res.url,
        }));
    });

    await Promise.all(promisesUpload).then((values: Array<FileInfo>) => {
      const newValue = multiple && value && value.length > 0 ? [...value, ...values] : values;
      setLoading(false);
      onChange(newValue);

      // delayed to see loading complete
      setTimeout(() => {
        setLoaderDisplay(false);
      }, TIMEOUT_LOADER_DISPLAY);
    });
  };

  return (
    <ReactDropzone
      onDrop={acceptedFiles => onDrop(acceptedFiles, value)}
      onDropRejected={() => setError(errors.DEFAULT)}
      multiple={multiple}
      disabled={disabled}
      accept={accept}
      minSize={minSize}
      maxSize={maxSize}>
      {({ getRootProps, getInputProps }) => (
        <DropzoneContainer {...getRootProps()}>
          <input {...getInputProps()} />
          <FormattedMessage id="global.image_uploader.file.dropzone" />
          <button type="button" className="btn-pick-file">
            <FormattedMessage id="global.form.ranking.select" />
          </button>

          {(isLoading || isLoaderDisplay) && (
            <FakeLoaderBar
              isLoading={isLoading}
              isFinished={!isLoading && isLoaderDisplay}
              timeToEnd={TIMEOUT_LOADER_DISPLAY}
            />
          )}
        </DropzoneContainer>
      )}
    </ReactDropzone>
  );
};

export default Dropzone;
