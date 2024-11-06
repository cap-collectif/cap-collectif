import React, { useRef, useMemo, forwardRef } from 'react'
import dynamic from 'next/dynamic'
import { Box, CapUIFontFamily, useTheme } from '@cap-collectif/ui'
import { getApiUrl } from 'config'
import { IJodit } from 'jodit/types'
import { joditFileUploader } from '@shared/utils/joditFileUploader'

const Editor = dynamic(() => import('./JoditImport'), {
  ssr: false,
})
// eslint-disable-next-line react/display-name
const ForwardRefEditor = forwardRef((props: any, ref) => <Editor {...props} editorRef={ref} />)

type Props = {
  textAreaOnly?: boolean
  value?: any
  onChange: (value: string) => void
  id?: string
  disabled?: boolean
  platformLanguage: string
  selectedLanguage?: string
  placeholder?: string
  limitChars?: number
}

const limitedConf = [
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
  joditFileUploader,
  'link',
  '|',
  'undo',
  'redo',
  '|',
  'hr',
]

const getConfig = (
  platformLanguage: string | null,
  placeholder: string,
  editor: { current: { component: IJodit } },
  textAreaOnly: boolean,
  limitChars?: number,
) => {
  const buttons = limitChars
    ? limitedConf
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
        'file',
        'link',
        'table',
        '|',
        'undo',
        'redo',
        '|',
        'hr',
        'source',
      ]
  return {
    toolbarSticky: true,
    readonly: false,
    minHeight: textAreaOnly ? 100 : 300,
    limitChars,
    style: {
      background: 'white',
    },
    language: platformLanguage?.substr(0, 2)?.toLowerCase() || 'fr',
    placeholder,
    uploader: {
      url: `${getApiUrl()}/files`,
      format: 'json',
      credentials: 'same-origin',
      headers: {},
      prepareData: (data: any) => {
        data.append('file', data.getAll('files[0]')[0])
        data.delete('file[0]')
      },
      isSuccess: (resp: any) => {
        return !resp.errorCode
      },
      getMsg: (resp: any) => {
        return resp.msg.join !== undefined ? resp.msg.join(' ') : resp.msg
      },
      process: (resp: any) => {
        return {
          files: [resp.name],
          baseurl: resp.url,
          error: resp.error,
          msg: resp.msg,
        }
      },
      error: (e: any) => {
        console.error(e)
      },
      defaultHandlerError: (resp: any) => {
        console.error(resp)
      },
      defaultHandlerSuccess: (data: any) => {
        if (editor.current && editor.current.component) {
          if (/\.(gif|jpe?g|tiff?|png|webp|bmp)$/i.test(data.baseurl))
            editor.current.component.selection.insertImage(data.baseurl)
          else {
            const elm = editor.current.component.createInside.element('a')
            elm.setAttribute('href', data.baseurl)
            // eslint-disable-next-line prefer-destructuring
            elm.textContent = data.files[0]
            editor.current.component.selection.insertNode(elm)
          }
        }
      },
    },
    buttons,
    buttonsMD: buttons,
    buttonsSM: buttons,
    tabIndex: 0,
    disablePlugins: 'add-new-line',
  }
}

const Jodit = ({
  textAreaOnly = false,
  onChange,
  value,
  platformLanguage,
  id,
  selectedLanguage,
  placeholder = '',
  limitChars,
}: Props) => {
  const { colors, radii, space } = useTheme()
  const editor = useRef<any>(null)
  const styles = textAreaOnly
    ? {
        '.jodit-status-bar,.jodit-ui-group,.jodit-toolbar__box': { display: 'none' },
        '.jodit-workplace': { borderRadius: radii.normal },
        '.jodit-wysiwyg': {
          padding: `${space[3]} !important`,
          paddingTop: `${space[1]} !important`,
          paddingBottom: `${space[1]} !important`,
          maxHeight: '100px',
        },
        'span.jodit-placeholder': {
          color: colors.gray[500],
          fontFamily: CapUIFontFamily.Input,
          padding: `${space[4]} !important`,
          paddingTop: `${space[2]} !important`,
        },
        '.jodit-container.jodit': {
          border: `1px solid ${colors.gray[300]}`,
          borderRadius: radii.normal,
          '&:focus-within': { border: `1px solid ${colors.blue[500]}` },
        },
      }
    : {}

  const config = useMemo(
    () => getConfig(platformLanguage, placeholder, editor, textAreaOnly, limitChars),
    [platformLanguage],
  )

  return useMemo(
    () => (
      <Box
        id={id}
        className="joditEditor"
        sx={{
          // ! The styles below need to be in sync with style-admin.css
          ...styles,
          '.jodit-wysiwyg a': { textDecoration: 'underline' },
          '.jodit-wysiwyg h1': { fontSize: '36px' },
          '.jodit-wysiwyg h2': { fontSize: '30px' },
          '.jodit-wysiwyg h3': { fontSize: '24px' },
          '.jodit-wysiwyg h4': { fontSize: '18px' },
          '.jodit-wysiwyg ul, .jodit-wysiwyg ol': {
            marginBlockStart: '1em',
            marginBlockEnd: '1em',
            marginInlineStart: '0px',
            marginInlineEnd: '0px',
            paddingInlineStart: '40px',
          },
        }}
      >
        <ForwardRefEditor ref={editor} value={value} config={config} onChange={onChange} />
      </Box>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedLanguage],
  )
}

export default Jodit
