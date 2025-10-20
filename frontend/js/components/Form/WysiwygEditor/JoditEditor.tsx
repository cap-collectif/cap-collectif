import React, { useRef, useMemo } from 'react'
import JoditEditor from 'jodit-react'
import { InsertMode, IJodit } from 'jodit/types'
import AppBox from '~/components/Ui/Primitives/AppBox'
import localConfig from '~/config'
import { FILE_UPLOAD_POPUP_OPENED, joditFileUploader, linktooltip, uppyListener } from '@shared/utils/joditFileUploader'
import { useIntl } from 'react-intl'

export type Props = {
  value?: any
  onChange: (arg0: string) => void
  id?: string
  name: string
  className: string
  disabled?: boolean
  initialContent?: string | null | undefined
  currentLanguage: string
  withCharacterCounter?: boolean
  maxLength?: string
  selectedLanguage?: string
  noCode?: boolean
  clientConfig?: boolean
}

const CLIENT_CONFIG = [
  'bold',
  'italic',
  'underline',
  'strikethrough',
  'eraser',
  '|',
  'ul',
  'ol',
  '|',
  'left',
  'center',
  'right',
  'justify',
  '|',
  'fontsize',
  'brush',
  'paragraph',
  '|',
  'image',
  'video',
  'link',
]

const getConfig = (
  currentLanguage,
  noCode,
  editor: { current: { component: IJodit } },
  clientConfig,
  disabled,
  intl,
) => {
  const buttons = clientConfig
    ? CLIENT_CONFIG
    : [
        'bold',
        'italic',
        'underline',
        'strikethrough',
        'eraser',
        '|',
        'ul',
        'ol',
        '|',
        'left',
        'center',
        'right',
        'justify',
        '|',
        'fontsize',
        'brush',
        'paragraph',
        '|',
        'superscript',
        'subscript',
        '|',
        'image',
        'video',
        joditFileUploader,
        'link',
        'table',
        '|',
        'undo',
        'redo',
        '|',
        'hr',
        noCode ? '' : 'source',
      ]
  return {
    readonly: false,
    minHeight: 300,
    style: {
      background: 'white',
    },
    disabled,
    language: currentLanguage?.substr(0, 2) || 'fr',
    askBeforePasteHTML: false,
    askBeforePasteFromWord: false,
    defaultActionOnPaste: 'insert_clear_html' as InsertMode,
    uploader: {
      url: `${localConfig.getApiUrl()}/files`,
      format: 'json',
      credentials: 'same-origin',
      headers: {},
      prepareData: data => {
        data.append('file', data.getAll('files[0]')[0])
        data.delete('file[0')
      },
      isSuccess: resp => {
        return !resp.errorCode
      },
      getMsg: resp => {
        return resp.msg.join !== undefined ? resp.msg.join(' ') : resp.msg
      },
      process: resp => {
        return {
          files: [resp.name],
          baseurl: resp.url,
          error: resp.error,
          msg: resp.msg,
        }
      },
      error: e => {
        console.error(e)
      },
      defaultHandlerError: resp => {
        console.error(resp)
      },
      defaultHandlerSuccess: data => {
        if (editor.current) {
          if (/\.(gif|jpe?g|tiff?|png|webp|bmp)$/i.test(data.baseurl))
            editor.current.component.s.insertImage(data.baseurl)
          else {
            const elm = editor.current.component.createInside.element('a')
            elm.setAttribute('href', data.baseurl)
            elm.textContent = data.files[0]
            editor.current.component.s.insertNode(elm)
          }
        }
      },
    },
    buttons,
    buttonsMD: buttons,
    buttonsSM: buttons,
    tabIndex: 0,
    disablePlugins: 'add-new-line',
    events: {
      [FILE_UPLOAD_POPUP_OPENED]: (editor: IJodit) => uppyListener(editor, currentLanguage, intl),
    },
    popup: {
      a: linktooltip,
    },
  }
}

const Jodit = ({
  onChange,
  value,
  currentLanguage,
  id,
  selectedLanguage,
  noCode,
  clientConfig,
  disabled = false,
}: Props) => {
  const intl = useIntl()
  const editor = useRef<any>(null)
  const config = useMemo(
    () => getConfig(currentLanguage, noCode, editor, clientConfig, disabled, intl),
    [currentLanguage, noCode, clientConfig, disabled, intl],
  )

  return useMemo(
    () => (
      <AppBox id={id} className="joditEditor">
        <JoditEditor
          ref={editor}
          value={value}
          config={config} // eslint-disable-next-line jsx-a11y/tabindex-no-positive
          tabIndex={1}
          onChange={onChange}
        />
      </AppBox>
    ), // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedLanguage],
  )
}

export default Jodit
