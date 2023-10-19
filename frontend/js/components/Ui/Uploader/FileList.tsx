import * as React from 'react'
import { useIntl } from 'react-intl'
import Flex from '~ui/Primitives/Layout/Flex'
import Icon from '~ds/Icon/Icon'
import Text from '~ui/Primitives/Text'
import ButtonQuickAction from '~ds/ButtonQuickAction/ButtonQuickAction'
import { FileItem, FileList } from '~ui/Uploader/Uploader.styles'

export type FilesListProps = {
  droppedFiles: File[]
  onRemove: (arg0: File) => void
}

const FilesList = ({ droppedFiles, onRemove }: FilesListProps) => {
  const intl = useIntl()

  if (droppedFiles.length > 0) {
    return (
      <FileList>
        {droppedFiles.map(file => (
          <FileItem key={file.name}>
            <Flex direction="row" align="center" justify="flex-start">
              <Icon size="md" name="FILE" color="gray.300" />
              <Text fontSize={2} lineHeight="sm">
                {!!file.name && file?.name}
              </Text>
            </Flex>
            <ButtonQuickAction
              label={intl.formatMessage({
                id: 'global.delete',
              })}
              onClick={() => onRemove(file)}
              icon="TRASH"
              size="md"
              variantColor="danger"
            />
          </FileItem>
        ))}
      </FileList>
    )
  }

  return null
}

export default FilesList
