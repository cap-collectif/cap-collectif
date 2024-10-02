import * as React from 'react'
import { useIntl } from 'react-intl'
import { Box, Flex, Heading } from '@cap-collectif/ui'
import { useDropzone, DropzoneOptions } from 'react-dropzone'

type Mode = 'fullscreen' | 'click'

export type FileInfo = {
  id: string
  name: string
  size: string
  url: string
}

const DropzoneWrapper: React.FC<{ children: React.ReactNode; mode?: Mode } & DropzoneOptions> = ({
  mode = 'fullscreen',
  children,
  noDragEventsBubbling = true,
  ...rest
}) => {
  const intl = useIntl()

  const { getRootProps, getInputProps, isFocused, isDragActive, isDragAccept, isDragReject } = useDropzone({
    noClick: mode === 'fullscreen',
    noDragEventsBubbling,
    ...rest,
  })

  return (
    <>
      {isDragActive && mode === 'fullscreen' ? (
        <Flex
          direction="column"
          justifyContent="center"
          alignItems="center"
          zIndex={9}
          bg="primary.100"
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          opacity={0.95}
          sx={{ pointerEvents: 'none' }}
        >
          <Heading as="h1" color="primary.800">
            {intl.formatMessage({ id: 'drop-file' })}
          </Heading>
          <Heading as="h3" color="primary.800" fontSize={5}>
            {intl.formatMessage({ id: 'drop-file-helptext' })}
          </Heading>
        </Flex>
      ) : null}
      <Box {...getRootProps({ isFocused, isDragAccept, isDragReject })}>
        <input {...getInputProps()} />
        {children}
      </Box>
    </>
  )
}

export default DropzoneWrapper
