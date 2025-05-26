import type { FileRejection } from 'react-dropzone'
import type { IntlShape } from 'react-intl'
import type { UploaderProps as CapUploaderProps } from '@cap-collectif/ui'

export type ApiFileInfo = {
  id: string
  name: string
  size: string
  url: string
  type: string
}

export type UploaderValue = ApiFileInfo | ApiFileInfo[] | null | undefined

export interface UploaderProps
  extends Omit<
    CapUploaderProps,
    'wording' | 'isInvalid' | 'isRequired' | 'onDrop' | 'onChange'
  > {
  onDrop?: CapUploaderProps['onDrop']
  uploadURI?: string
  onChange?: (value: UploaderValue) => void
}

export enum ErrorCode {
  FileInvalidType = 'file-invalid-type',
  FileTooLarge = 'file-too-large',
  FileTooSmall = 'file-too-small',
  TooManyFiles = 'too-many-files',
}

const formatMediaSize = (size: number) => {
  let newSize

  if (size / 1000 < 1000) {
    newSize = `${Math.round(size / 1000)} Ko`
  } else if (size / 1000000 < 1000) {
    newSize = `${Math.round(size / 1000000)} Mo`
  } else {
    newSize = `${Math.round(size / 1000000000)} Go`
  }
  return newSize
}

export type UploaderError = string | string[] | null
export type UploaderWarning = string | null

export async function uploadFiles(
  files: File[],
  uploadURI: string,
): Promise<ApiFileInfo[]> {
  const allFilesUpload: Promise<ApiFileInfo>[] = files.map(file => {
    const formData = new FormData()
    formData.append('file', file)

    return fetch(uploadURI, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {},
      body: formData,
    })
      .then(response => response.json())
      .then((res: ApiFileInfo) => ({
        id: res.id,
        name: res.name,
        size: res.size,
        url: res.url,
        type: res.type,
      }))
  })

  return Promise.all(allFilesUpload).then((values: ApiFileInfo[]) => values)
}

const getErrorsFile = (
  fileRejections: FileRejection[],
  intl: IntlShape,
  rules: {
    maxSize?: UploaderProps['maxSize']
    format?: UploaderProps['format']
  },
): string[] => {
  return fileRejections
    .map(fileWithError => {
      const mainError = fileWithError.errors[0]

      if (rules?.maxSize && mainError.code === ErrorCode.FileTooLarge) {
        return intl.formatMessage(
          { id: 'error-image-too-big' },
          { size: formatMediaSize(rules.maxSize) },
        )
      } else if (
        rules?.format &&
        mainError.code === ErrorCode.FileInvalidType
      ) {
        const fileExtension = fileWithError.file.type.split('/')[1]
        const fileName = fileWithError.file.name

        return intl.formatMessage(
          { id: 'error-file-not-supported' },
          { fileName, fileExtension },
        )
      }

      return ''
    })
    .filter(Boolean)
}

export const handleErrors = (
  fileRejections: FileRejection[],
  setError: (error: UploaderError) => void,
  multiple: boolean,
  intl: IntlShape,
  rules: {
    maxSize?: UploaderProps['maxSize']
    format?: UploaderProps['format']
  },
): void => {
  const errors = getErrorsFile(fileRejections, intl, rules)

  if (multiple) setError(errors)
  else setError(errors[0])
}

export const handleWarning = (
  files: File[],
  setWarning: (warning: string) => void,
  intl: IntlShape,
  minResolution?: UploaderProps['minResolution'],
): void => {
  const isImage = getFileType(files[0].type) === 'image'

  if (!isImage) return

  if (minResolution) {
    const img = new Image()

    img.onload = function () {
      if (
        img.width &&
        img.height &&
        minResolution.width &&
        minResolution.height
      ) {
        if (
          img.width < minResolution.width ||
          img.height < minResolution.height
        )
          setWarning(intl.formatMessage({ id: 'warning-image-quality' }))
      }
    }

    img.src = URL.createObjectURL(files[0])
  } else if (files[0].size > mgtob(1.5)) {
    setWarning(intl.formatMessage({ id: 'warning-image-size-big' }))
  }
}

export function getFileType(format: string): string {
  if (/^(.+?)\//.test(format)) {
    return format.split('/')[0]
  }
  if (/^\./.test(format)) {
    return format.split('.')[1]
  }
  return format
}

export function mgtob(megas: number): number {
  return megas * 1024 * 1024
}

export function btomg(bytes: number): number {
  return Math.round((bytes / 1024 / 1024) * 10) / 10
}
