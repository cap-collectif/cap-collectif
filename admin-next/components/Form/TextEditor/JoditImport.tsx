import React, { LegacyRef } from 'react'
import Editor, { JoditProps } from 'jodit-react'

export default function WrappedEditor({ editorRef, ...props }: JoditProps & { editorRef: LegacyRef<Editor> }) {
  return <Editor {...props} ref={editorRef} />
}
