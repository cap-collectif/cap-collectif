import * as React from 'react'

type Props = {
  input: any
  id: string
  name: string
  fileAccept?: Array<string>
  label?: string
  className?: string
  multiple?: boolean
  callback: () => void
}
export type FormatFile = Array<File>

const handleChangeForReduxForm = (handler, files: FileList) => {
  const formatFile: FormatFile = Array.from(files).map((file: File) => file)
  return handler(formatFile)
}

const FileInput = ({
  input: { onChange, onBlur, value: omitValue, ...inputProps },
  label,
  id,
  name,
  multiple,
  fileAccept,
  className,
  callback,
  ...props
}: Props) => (
  <>
    {label && <label htmlFor={id}>{label}</label>}
    <input
      type="file"
      className={className}
      id={id}
      name={name}
      accept={fileAccept && fileAccept.join(',')}
      onChange={({ target: { files } }) => {
        handleChangeForReduxForm(onChange, files)
        if (typeof callback === 'function') callback()
      }}
      multiple={multiple}
      {...inputProps}
      {...props}
    />
  </>
)

export default FileInput
