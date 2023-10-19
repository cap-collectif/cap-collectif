import { $Values } from 'utility-types'
import React, { useState } from 'react'
import { FormattedMessage } from 'react-intl'
import Dropzone from '~ui/Form/Dropzone/Dropzone'
import Help from '~ui/Form/Help/Help'
import File from '~ui/File/File'
import FileUploadContainer from './FileUpload.style'
import { TYPE_FORM } from '~/constants/FormConstants'
import type { FileInfo } from '~/components/Ui/File/File'
import Icon, { ICON_NAME } from '~ui/Icons/Icon'
import { ALLOWED_MIMETYPES } from '~/config'

const MAX_FILE = 5
const MAX_FILE_SIZE = 10000000 // 10 Mo

const ERROR_TYPE = {
  DEFAULT: ['impossible-to-download-document', 'unavailable-selected-file'],
  MAX_FILE: ['impossible-to-download-document', 'more-than-5-documents-error'],
}
type Props = {
  id: string
  typeForm: $Values<typeof TYPE_FORM>
  onChange: (value: Array<FileInfo>) => void
  className?: string
  disabled?: boolean
  value: Array<FileInfo> | null
}

const FileUpload = ({ id, typeForm, className, onChange, disabled, value }: Props) => {
  const [errors, setErrors] = useState<Array<string> | null>(null)

  const deleteFile = currentIdFile => {
    if (value) {
      const newValue = value.filter(media => media.id !== currentIdFile)
      onChange(newValue)
    }
  }

  return (
    <FileUploadContainer id={id} className={className} aria-labelledby={`label-${id}`}>
      <Help typeForm={typeForm}>
        <FormattedMessage id="max-weight-10mo" />
      </Help>

      <Dropzone
        onChange={onChange}
        setError={setErrors}
        errors={ERROR_TYPE}
        accept={ALLOWED_MIMETYPES}
        disabled={disabled || value?.length === MAX_FILE}
        value={value}
        maxSize={MAX_FILE_SIZE}
        maxFile={MAX_FILE}
        multiple
      />

      {errors && errors.length > 0 && (
        <div className="wrapper-error">
          <Icon name={ICON_NAME.error} size={15} />
          {errors.map(error => (
            <>
              <FormattedMessage id={error} />
              &nbsp;
            </>
          ))}
        </div>
      )}

      {value && value.length > 0 && (
        <div className="file-list">
          {value.map((media: FileInfo) => (
            <File {...media} onDelete={() => deleteFile(media.id)} key={media.id} />
          ))}
        </div>
      )}
    </FileUploadContainer>
  )
}

export default FileUpload
