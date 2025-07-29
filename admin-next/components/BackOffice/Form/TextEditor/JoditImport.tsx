import React from 'react'
import Editor from 'jodit-react'

export default function WrappedEditor({ editorRef, ...props }: any) {
  return <Editor {...props} ref={editorRef} />
}
