import * as React from 'react'
import FileContainer from './File.style'
import Icon, { ICON_NAME } from '~/components/Ui/Icons/Icon'

export type FileInfo = {
  id: string
  name: string
  size: string
  url: string
}
type Props = FileInfo & {
  onDelete?: () => void
}
export const convertFileSize = (size: number) => {
  size = Math.abs(parseInt(size, 10))
  const formats = [
    [1, 'octets'],
    [1024, 'ko'],
    [1024 * 1024, 'Mo'],
    [1024 * 1024 * 1024, 'Go'],
    [1024 * 1024 * 1024 * 1024, 'To'],
  ]

  for (let i = 0; i < formats.length; i++) {
    if (size < formats[i][0]) return `${(size / formats[i - 1][0]).toFixed(0)} ${formats[i - 1][1]}`
  }
}

const formatSize = (size: string) => {
  // only numbers
  if (size.match(/^[0-9]+$/) !== null) {
    const sizeAsNumber = parseInt(size, 10)
    return convertFileSize(sizeAsNumber)
  }

  if (typeof size === 'string') {
    const sizeAsInt = parseInt(size.split(' ')[0], 10).toFixed(0)
    const unit = size.split(' ')[1]
    return `${sizeAsInt} ${unit}`
  }

  return size
}

const File = ({ name, size, url, onDelete }: Props) => (
  <FileContainer>
    <div className="file-name">
      <Icon name={ICON_NAME.file} size={16} />
      <a href={url} title={name} target="_blank" rel="noopener noreferrer">
        <span>{name}</span>
      </a>
    </div>

    <div>
      <span>{formatSize(size)}</span>
      {onDelete ? (
        <button type="button" className="btn-delete" onClick={onDelete}>
          <Icon name={ICON_NAME.trash} size={12} />
        </button>
      ) : null}
    </div>
  </FileContainer>
)

export default File
