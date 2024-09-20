import { IJodit } from 'jodit/types'

/**
 * This is inspired from https://github.com/xdan/jodit/blob/main/src/modules/widget/file-selector/file-selector.ts
 */
export const joditFileUploader = {
  tooltip: 'Insert file',
  icon: 'file',
  popup: (editor: IJodit) => {
    editor.s.save()
    const dragBox = editor.c.fromHTML(
      '<div class="jodit-drag-and-drop__file-box" style="padding: 30px 20px;">' +
        `<strong>${editor.i18n('Drop file')}</strong>` +
        `<span><br>${editor.i18n('or click')}</span>` +
        `<input type="file" accept="*" tabindex="-1" dir="auto" multiple=""/>` +
        '</div>',
    )
    editor.uploader.bind(
      dragBox,
      resp => {
        // @ts-ignore Jodit types not up to date
        const handler = editor.o.uploader.defaultHandlerSuccess
        handler.call(editor, resp)
        editor.e.fire('closeAllPopups')
      },
      error => {
        editor.message.error(error.message)
        editor.e.fire('closeAllPopups')
      },
    )

    return dragBox
  },
}
