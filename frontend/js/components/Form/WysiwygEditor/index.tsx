import * as React from 'react'
import { useSelector } from 'react-redux'
import type { Props as JoditProp } from './JoditEditor'
import Jodit from './JoditEditor'
import type { GlobalState } from '~/types'
// TODO: during the switch we can not add correct props, types
// Once the old editor is removed, please fix this.
type Props = JoditProp & {
  readonly clientConfig?: boolean
  readonly initialContent?: string
  unstable__enableCapcoUiDs?: boolean
  formName?: string
}

const EditorSwitcher = ({ initialContent, clientConfig, ...props }: Props) => {
  const currentLanguage = useSelector((state: GlobalState) => state.language.currentLanguage)
  return <Jodit {...props} value={initialContent} currentLanguage={currentLanguage} clientConfig={clientConfig} />
}

export default EditorSwitcher
