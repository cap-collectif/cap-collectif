import Uppy from '@uppy/core'
import FileInput from '@uppy/file-input'
import StatusBar from '@uppy/status-bar'
import Tus from '@uppy/tus'
import { Jodit } from 'jodit/types'

import fr from '@uppy/locales/lib/fr_FR'
import { onElementAvailable } from '@shared/navbar/NavBar.utils'
import { IntlShape } from 'react-intl'
import { ALLOWED_MIMETYPES_WITH_ARCHIVES } from './acceptedFiles'
import { dangerToast } from './toasts'

export const FILE_UPLOAD_POPUP_OPENED = 'file_upload_popup_opened'
const barTarget = 'uppyStatusBar'
const fileInput = 'uppyFileInput'

const SIZE_LIMIT = 104857600 // 100Mo

const formats =
  '.png, .svg, .gif, .jp(e)g, .webp, .doc, .docx, .odt, .txt, .pdf, .xls, .xlsx, .ods, .csv, .ppt, .pptx, .zip, .rar, .7z, .gz, .tar, .bz2'

export const joditFileUploader = {
  tooltip: 'Insert file',
  icon: 'file',
  name: 'uppyFileUpload',
  popup: (editor: Jodit) => {
    editor.s.save()
    const dragBox = editor.c.fromHTML(
      `<div id="${barTarget}"></div><div id="${fileInput}" style="opacity:0;height:0;width:0;"></div>`,
    )
    editor.e.fire(FILE_UPLOAD_POPUP_OPENED, editor)
    return dragBox
  },
}

export const uppyListener = (editor: Jodit, platformLanguage: string, intl: IntlShape) => {
  onElementAvailable(`#${fileInput}`, () => {
    editor.s.save()
    new Uppy({
      autoProceed: true,
      restrictions: { maxNumberOfFiles: 1, allowedFileTypes: ALLOWED_MIMETYPES_WITH_ARCHIVES },
      onBeforeFileAdded: currentFile => {
        if (!ALLOWED_MIMETYPES_WITH_ARCHIVES.includes(currentFile.type)) {
          dangerToast(intl.formatMessage({ id: 'error.format_not_handled' }, { formats }))
          editor.e.fire('closeAllPopups')
          return false
        }
        if (currentFile?.size > SIZE_LIMIT) {
          editor.e.fire('closeAllPopups')
          dangerToast(intl.formatMessage({ id: 'error.size_too_big' }, { size: '100Mo' }))
          return false
        }

        // Some special characters are forbidden by tus-php : https://github.com/ankitpokhrel/tus-php/blob/main/src/Request.php#L238
        // We remove it from the file name to complete the upload
        // to see replacements : https://regex101.com/r/lLkUG5/1
        const cleanFileName = currentFile.name
          .replace(/\.\.\//g, '')
          .replace(/['"&\/\\?#:!]/g, '')
          .trim()

        currentFile.meta = {
          name: cleanFileName,
        }

        return currentFile
      },
    })
      .use(FileInput, { target: `#${fileInput}` })
      .use(StatusBar, {
        target: `#${barTarget}`,
        locale: platformLanguage?.toLocaleLowerCase().includes('fr') ? fr : undefined,
        showProgressDetails: true,
        hideCancelButton: true,
      })
      .use(Tus, {
        // Approx. 5Mo
        chunkSize: 5000000,
        endpoint: `${window.location.origin}/tus-upload`,
        removeFingerprintOnSuccess: true,
        onAfterResponse: function (req, res) {
          const fileUrl = res.getHeader('File-URL')

          if (!fileUrl) {
            return
          }

          if (editor.selection) {
            const elm = editor.createInside.element('a')
            elm.setAttribute('href', fileUrl)
            // eslint-disable-next-line prefer-destructuring
            elm.textContent = this.metadata.name
            editor.selection.insertNode(elm)
          }
          editor.e.fire('closeAllPopups')
        },
        onError: function (err) {
          // eslint-disable-next-line no-console
          console.log(err)
        },
      })
    const input = document?.querySelector(`#${fileInput} input`) as HTMLInputElement
    input.addEventListener('cancel', () => {
      editor.e.fire('closeAllPopups')
    })
    if (input) input.click()
  })
}

// https://github.com/jodit/jodit-react/issues/180
export const markAsAtomic = obj => {
  Object.defineProperty(obj, 'isAtom', {
    enumerable: false,
    value: true,
    configurable: false,
  })

  return obj
}

export const linktooltip = markAsAtomic([
  {
    name: 'eye',
    tooltip: 'Open link',
    exec: (editor: Jodit, current): void => {
      const href = current?.href

      if (current && href) {
        editor.ow.open(href)
      }
    },
  },
  {
    name: 'link',
    tooltip: 'Edit link',
    icon: 'pencil',
  },
  'unlink',
  'brush',
])
