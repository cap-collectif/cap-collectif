// @flow
import * as React from 'react';
import { useDropzone } from 'react-dropzone';
import { useIntl } from 'react-intl';
import Text from '~ui/Primitives/Text';
import { type AppBoxProps, type Responsive } from '~ui/Primitives/AppBox.type';
import Illustration from '~ui/Uploader/Illustration';
import Icon from '~ds/Icon/Icon';
import fileType from '~/utils/fileType';
import fileSizeConvert from '~/utils/fileSizeConvert';
import {
  UploaderContainer,
  ThumbContainer,
  Container,
  Thumbnail,
  Content,
  WarningList,
  ThumbnailControls,
} from './Uploader.styles';
import Errors from './Errors';
import FilesList from './FileList';
import Flex from '~ui/Primitives/Layout/Flex';
import ButtonQuickAction from '~ds/ButtonQuickAction/ButtonQuickAction';

export const UPLOADER_SIZE = {
  SM: 'sm', // 184px
  MD: 'md', // 240px
  LG: 'lg', // 488px
};
const MAX_SIZE_FOR_IMAGES = 1.5;

export type Size = {|
  width: number,
  height: number,
|};

export type Props = {|
  ...AppBoxProps,
  size?: Responsive<$Values<typeof UPLOADER_SIZE>>,
  circle?: boolean,
  label?: string,
  format: 'image/*' | 'audio/*' | 'video/*' | Array<string>, // https://react-dropzone.js.org/#section-accepting-specific-file-types
  maxSize: number,
  minResolution: Size,
  multiple?: boolean,
  disabled: boolean,
|};

export const WARNING_TYPE = {
  LARGE_IMAGE: 'warning.large.image',
  SMALL_IMAGE: 'download-small-image',
};

const Uploader = ({
  size = UPLOADER_SIZE.LG,
  circle,
  label,
  format,
  maxSize,
  minResolution,
  multiple,
  disabled,
}: Props) => {
  const intl = useIntl();
  const [thumb, setThumb] = React.useState<?string>(null);
  const [drag, setDrag] = React.useState<boolean>(false);
  const [warning, setWarning] = React.useState<?string>(null);
  const [droppedFiles, setDroppedFiles] = React.useState<File[]>([]);
  React.useEffect(() => {
    return () => {
      if (thumb) {
        URL.revokeObjectURL(thumb);
      }
    };
  }, [thumb]);
  const onDrop = React.useCallback(
    files => {
      if (files.length === 0) {
        setDrag(false);
        return;
      }
      if (!multiple) {
        setDroppedFiles([...droppedFiles, files[0]]);
        setThumb(URL.createObjectURL(files[0]));
        // eslint-disable-next-line no-undef
        const img = new Image();
        img.onload = function() {
          if (this.width && this.height) {
            if (this.width < minResolution.width || this.height < minResolution.height)
              setWarning(intl.formatMessage({ id: WARNING_TYPE.SMALL_IMAGE }));
          }
        };
        img.src = URL.createObjectURL(files[0]);

        if (files[0].size > fileSizeConvert.mgtob(MAX_SIZE_FOR_IMAGES)) {
          setWarning(intl.formatMessage({ id: WARNING_TYPE.LARGE_IMAGE }));
        }
        setDrag(false);
      }
      setDroppedFiles([...droppedFiles, ...files]);
      setDrag(false);
    },
    [droppedFiles, intl, minResolution.height, minResolution.width, multiple],
  );

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
    fileRejections,
    acceptedFiles,
  } = useDropzone({
    multiple,
    disabled,
    maxSize: fileSizeConvert.mgtob(maxSize),
    accept: format,
    onDrop,
    onDragEnter: () => {
      setDrag(true);
    },
    onDragLeave: () => {
      setDrag(false);
    },
  });
  const removeFile = file => {
    if (!file) {
      setDroppedFiles([]);
      setThumb(null);
      setWarning(null);
      return;
    }
    const newFiles = [...droppedFiles];
    newFiles.splice(newFiles.indexOf(file), 1);
    setDroppedFiles(newFiles);
  };

  const getContent = () => {
    switch (size) {
      case UPLOADER_SIZE.LG:
        return (
          <Content initial="rest" whileHover="hover" animate="rest">
            {drag ? (
              <Text textAlign="center" fontWeight="semibold" fontSize={4} color="blue.800">
                {intl.formatMessage(
                  { id: 'uploader-prompt' },
                  { count: 5, fileType: fileType(format) },
                )}
              </Text>
            ) : (
              <>
                <Illustration key={0} />
                <Text key={1} textAlign="center" fontSize={3} lineHeight="base" color="gray.500">
                  {intl.formatMessage(
                    { id: 'uploader-prompt' },
                    { count: 5, fileType: fileType(format) },
                  )}
                </Text>
              </>
            )}
          </Content>
        );
      case UPLOADER_SIZE.MD:
        return (
          <Content>
            {drag ? (
              <Text textAlign="center" fontWeight="semibold" fontSize={4} color="blue.800">
                {intl.formatMessage(
                  { id: 'uploader-prompt' },
                  { count: 5, fileType: fileType(format) },
                )}
              </Text>
            ) : (
              <Text width="70%" textAlign="center" fontSize={3} lineHeight="base" color="gray.500">
                {intl.formatMessage(
                  { id: 'uploader-prompt' },
                  { count: 5, fileType: fileType(format) },
                )}
              </Text>
            )}
          </Content>
        );
      default:
        return (
          <Content>
            <Icon
              name={drag ? 'ADD_DRAG' : 'ADD'}
              size="lg"
              color={drag ? 'blue.500' : 'gray.500'}
            />
          </Content>
        );
    }
  };

  return (
    <UploaderContainer size={size}>
      {!!label && (
        <Flex direction="column" mb={2}>
          <Text fontSize={2} lineHeight="sm" color="gray.900">
            {label}
          </Text>
          <Flex direction="row" wrap="wrap">
            <Text
              display="flex"
              flexDirection="row"
              marginRight={1}
              fontSize={1}
              lineHeight="sm"
              color="gray.500">
              {intl.formatMessage({ id: 'uploader.banner.format' })}
              <Text lineHeight="sm" color="gray.900">
                {format}
              </Text>
            </Text>
            <Text
              display="flex"
              flexDirection="row"
              marginRight={1}
              fontSize={1}
              lineHeight="sm"
              color="gray.500">
              {intl.formatMessage({ id: 'uploader.banner.weight' })}
              <Text lineHeight="sm" color="gray.900">
                {maxSize}mo
              </Text>
            </Text>
            <Text display="flex" flexDirection="row" fontSize={1} lineHeight="sm" color="gray.500">
              {intl.formatMessage({ id: 'uploader.banner.resolution' })}
              <Text lineHeight="sm" color="gray.900">
                {minResolution.width}x{minResolution.height}px
              </Text>
            </Text>
          </Flex>
        </Flex>
      )}
      <Container
        drag={drag}
        circle={circle}
        size={size}
        {...getRootProps({ isDragActive, isDragAccept, isDragReject })}>
        <input {...getInputProps()} />
        {getContent()}
        {thumb && (
          <ThumbContainer>
            <Thumbnail size={size} circle={circle} src={thumb} alt="" />
            <ThumbnailControls size={size} circle={circle}>
              <ButtonQuickAction
                label={intl.formatMessage({ id: 'global.delete' })}
                onClick={e => {
                  e.stopPropagation();
                  removeFile();
                }}
                icon="TRASH"
                size="md"
                iconColor="white"
                variantColor="danger"
              />
            </ThumbnailControls>
          </ThumbContainer>
        )}
      </Container>
      <Errors
        fileRejections={fileRejections}
        multiple={multiple}
        maxSize={maxSize}
        acceptedFiles={acceptedFiles}
      />
      {warning && (
        <WarningList>
          <Text color="orange.900" fontSize={1} lineHeight="sm" fontWeight="normal">
            {warning}
          </Text>
        </WarningList>
      )}

      {multiple && <FilesList droppedFiles={droppedFiles} onRemove={removeFile} />}
    </UploaderContainer>
  );
};

export default Uploader;
