import { Box, InputProps, useTheme } from '@cap-collectif/ui'
import {
  FILE_UPLOAD_POPUP_OPENED,
  joditFileUploader,
  joditUploadFormats,
  linktooltip,
  uppyListener,
} from '@shared/utils/joditFileUploader'
import { dangerToast } from '@shared/utils/toasts'
// @ts-ignore
import '@uppy/core/dist/style.min.css'
// @ts-ignore
import '@uppy/status-bar/dist/style.min.css'
import { getApiUrl } from 'config'
import { Jodit as IJodit } from 'jodit/types'
import dynamic from 'next/dynamic'
import { normalizeLegacyTableBorders } from '@shared/utils/normalizeLegacyTableBorders'
import React, { forwardRef, useCallback, useEffect, useMemo, useRef } from 'react'
import { IntlShape, useIntl } from 'react-intl'

const Editor = dynamic(() => import('./JoditImport'), {
  ssr: false,
})
export type EditorA11yOptions = {
  // Id of the visible label of the field, used to name the editable area and the toolbar
  labelId?: string
  required?: boolean
  // Called once the editor is ready, with the Jodit instance
  onInit?: (editor: IJodit) => void
}

const TOOLBAR_KEYS = ['ArrowRight', 'ArrowLeft', 'Home', 'End']

// Only write attributes that change: the MutationObserver below would otherwise loop on its own writes
const setAttr = (element: Element, name: string, value: string | null) => {
  if (value === null) {
    if (element.hasAttribute(name)) element.removeAttribute(name)
  } else if (element.getAttribute(name) !== value) element.setAttribute(name, value)
}

/**
 * Jodit 4 accessibility fixes, applied again whenever Jodit rebuilds its toolbar:
 * - the editable area is a named multiline textbox;
 * - the toolbar is a named role="toolbar", reachable with one Tab stop then the arrow keys (roving tabindex):
 *   Jodit puts all its buttons in tabindex="-1";
 * - Jodit names each button on its role="listitem" wrapper only (listitem without list): the name moves to the
 *   button and the wrapper becomes presentational;
 * - the dropdown arrows have an invalid role="trigger": they are hidden from assistive technologies (mouse only).
 */
const makeEditorAccessible = (editor: IJodit, { labelId, required }: EditorA11yOptions) => {
  const container = editor.container
  if (!container) return

  const editable = editor.editor
  if (editable) {
    editable.setAttribute('role', 'textbox')
    editable.setAttribute('aria-multiline', 'true')
    if (labelId) editable.setAttribute('aria-labelledby', labelId)
    if (required) editable.setAttribute('aria-required', 'true')
  }

  let currentIndex = 0
  const getToolbarButtons = () =>
    Array.from(
      container.querySelectorAll<HTMLButtonElement>('.jodit-toolbar__box .jodit-toolbar-button__button'),
    ).filter(button => !button.disabled)

  const apply = () => {
    container.querySelectorAll<HTMLElement>('.jodit-toolbar-button[role="listitem"]').forEach(item => {
      const button = item.querySelector('button')
      const label = item.getAttribute('aria-label')
      if (button && label && !button.textContent?.trim()) setAttr(button, 'aria-label', label)
      setAttr(item, 'role', 'none')
      setAttr(item, 'aria-label', null)
    })
    container.querySelectorAll<HTMLElement>('[role="trigger"]').forEach(trigger => {
      setAttr(trigger, 'role', null)
      setAttr(trigger, 'aria-hidden', 'true')
    })
    const toolbar = container.querySelector<HTMLElement>('.jodit-toolbar__box')
    if (toolbar) {
      setAttr(toolbar, 'role', 'toolbar')
      if (labelId) setAttr(toolbar, 'aria-labelledby', labelId)
    }
    const buttons = getToolbarButtons()
    currentIndex = Math.min(currentIndex, Math.max(buttons.length - 1, 0))
    buttons.forEach((button, index) => setAttr(button, 'tabindex', index === currentIndex ? '0' : '-1'))
  }

  const onToolbarKeyDown = (event: KeyboardEvent) => {
    if (!TOOLBAR_KEYS.includes(event.key)) return
    const buttons = getToolbarButtons()
    const index = buttons.indexOf(event.target as HTMLButtonElement)
    if (index === -1) return
    event.preventDefault()
    if (event.key === 'ArrowRight') currentIndex = (index + 1) % buttons.length
    if (event.key === 'ArrowLeft') currentIndex = (index - 1 + buttons.length) % buttons.length
    if (event.key === 'Home') currentIndex = 0
    if (event.key === 'End') currentIndex = buttons.length - 1
    apply()
    buttons[currentIndex].focus()
  }

  apply()
  container.addEventListener('keydown', onToolbarKeyDown)
  const observer = new MutationObserver(apply)
  observer.observe(container, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['aria-label', 'role'],
  })
  editor.e.on('beforeDestruct', () => {
    observer.disconnect()
    container.removeEventListener('keydown', onToolbarKeyDown)
  })
}

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
  clientConfig?: boolean
  variantColor?: InputProps['variantColor']
  // Id of the visible label of the field (see makeEditorAccessible)
  labelId?: string
  required?: boolean
  // Validation state of the field, exposed on the editable area (aria-invalid) so that the error message is
  // announced and the area can be focused as the first invalid field of a form
  invalid?: boolean
  // Id of the displayed error message, linked to the editable area while the field is invalid
  errorId?: string
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
  'fullsize',
]

const clientConfig = [
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
  platformLanguage: string | null,
  placeholder: string,
  editor: { current: { component: IJodit } },
  textAreaOnly: boolean,
  intl: IntlShape,
  limitChars?: number,
  disabled?: boolean,
  isClientConfig = false,
  a11y: EditorA11yOptions = {},
) => {
  const buttons = limitChars
    ? limitedConf
    : isClientConfig
    ? clientConfig
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
        'source',
        'fullsize',
      ]
  return {
    toolbarSticky: true,
    readonly: false,
    minHeight: textAreaOnly ? 100 : 300,
    limitChars,
    style: {
      background: 'white',
    },
    disabled,
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
        return resp?.success !== false && !resp?.errorCode
      },
      getMessage: (resp: any) => {
        if (Array.isArray(resp?.msg)) {
          return resp.msg.join(' ')
        }

        return resp?.errorCode || resp?.msg || resp?.data?.messages?.[0]?.message || 'error.format_not_handled'
      },
      process: (resp: any) => {
        return {
          files: [resp.name],
          baseurl: resp.url,
          error: resp.error,
          msg: resp.msg,
        }
      },
      error: () => {
        dangerToast(intl.formatMessage({ id: 'error.format_not_handled' }, { formats: joditUploadFormats }))
      },
      defaultHandlerError: () => {
        dangerToast(intl.formatMessage({ id: 'error.format_not_handled' }, { formats: joditUploadFormats }))
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
    events: {
      beforeSetValueToEditor: normalizeLegacyTableBorders,
      [FILE_UPLOAD_POPUP_OPENED]: (editor: IJodit) => uppyListener(editor, platformLanguage, intl),
      afterInit: (editor: IJodit) => {
        makeEditorAccessible(editor, a11y)
        a11y.onInit?.(editor)
      },
    },
    popup: {
      a: linktooltip,
    },
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
  clientConfig: isClientConfig = false,
  disabled,
  variantColor = 'default',
  labelId,
  required = false,
  invalid = false,
  errorId,
}: Props) => {
  const intl = useIntl()
  const { colors, radii, space } = useTheme()
  const editor = useRef<any>(null)
  const joditInstance = useRef<IJodit | null>(null)
  const validity = useRef({ invalid, errorId })
  validity.current = { invalid, errorId }

  // The editor is rendered once (see the memoized render below): its attributes are updated directly
  const applyValidity = useCallback(() => {
    const editable = joditInstance.current?.editor
    if (!editable) return
    setAttr(editable, 'aria-invalid', validity.current.invalid ? 'true' : null)
    setAttr(
      editable,
      'aria-describedby',
      validity.current.invalid && validity.current.errorId ? validity.current.errorId : null,
    )
  }, [])

  const onInit = useCallback(
    (instance: IJodit) => {
      joditInstance.current = instance
      applyValidity()
      instance.e.on('beforeDestruct', () => {
        if (joditInstance.current === instance) joditInstance.current = null
      })
    },
    [applyValidity],
  )

  useEffect(applyValidity, [invalid, errorId, applyValidity])
  const styles = textAreaOnly
    ? {
        '.jodit-status-bar,.jodit-ui-group,.jodit-toolbar__box': { display: 'none' },
        '.jodit-workplace': { borderTopLeftRadius: radii.normal, borderTopRightRadius: radii.normal },
        '.jodit-wysiwyg': {
          padding: `${space.lg} !important`,
          paddingTop: `${space.xxs} !important`,
          paddingBottom: `${space.xxs} !important`,
          maxHeight: '100px',
          background: `${colors.input[variantColor].background.default} !important`,
        },
        'span.jodit-placeholder': {
          color: colors.text.tertiary,
          padding: `${space.sm} !important`,
          paddingTop: `${space.xxs} !important`,
        },
        '.jodit-container.jodit': {
          border: 'unset',
          borderRadius: 'unset',
          borderBottom: `1px solid ${colors.input[variantColor].border.default}`,
          borderTopLeftRadius: radii.normal,
          borderTopRightRadius: radii.normal,
          '&:focus-within': {
            borderBottom: `1px solid ${colors.input[variantColor].border.selected}`,
            '.jodit-wysiwyg': { background: `${colors.input[variantColor].background.selected} !important` },
          },
        },
      }
    : {}

  const config = useMemo(
    () =>
      getConfig(platformLanguage, placeholder, editor, textAreaOnly, intl, limitChars, disabled, isClientConfig, {
        labelId,
        required,
        onInit,
      }),
    [
      platformLanguage,
      placeholder,
      textAreaOnly,
      intl,
      limitChars,
      disabled,
      isClientConfig,
      labelId,
      required,
      onInit,
    ],
  )

  return useMemo(
    () => (
      <Box
        id={id}
        className="joditEditor"
        sx={{
          // ! The styles below need to be in sync with style-admin.css
          // Jodit default placeholder color (#a5a5a5) is not contrasted enough on white (2.46:1)
          'span.jodit-placeholder': { color: colors.text.tertiary },
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
    [selectedLanguage, disabled],
  )
}

export default Jodit
