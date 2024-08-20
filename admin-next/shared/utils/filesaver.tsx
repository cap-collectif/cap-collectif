/* eslint-env browser */

// The one and only way of getting global scope in all environments
// https://stackoverflow.com/q/3277182/1008999
let _global: any
if (typeof window !== 'undefined') {
  _global =
    typeof window === 'object' && window.window === window
      ? window
      : typeof window.self === 'object' && window.self.self === window.self
      ? window.self
      : typeof global === 'object' && global.global === global
      ? global
      : this
}

function bom(blob: Blob, opts: { autoBom: boolean }) {
  if (typeof opts === 'undefined') opts = { autoBom: false }
  else if (typeof opts !== 'object') {
    console.warn('Deprecated: Expected third argument to be a object')
    opts = { autoBom: !opts }
  }

  // prepend BOM for UTF-8 XML and text/* types (including HTML)
  // note: your browser will automatically convert UTF-16 U+FEFF to EF BB BF
  if (opts.autoBom && /^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
    return new Blob([String.fromCharCode(0xfeff), blob], { type: blob.type })
  }
  return blob
}
// Detect WebView inside a native macOS app by ruling out all browsers
// We just need to check for 'Safari' because all other browsers (besides Firefox) include that too
// https://www.whatismybrowser.com/guides/the-latest-user-agent/macos
const isMacOSWebView =
  _global?.navigator &&
  /Macintosh/.test(navigator.userAgent) &&
  /AppleWebKit/.test(navigator.userAgent) &&
  !/Safari/.test(navigator.userAgent)

function corsEnabled(url: string) {
  const xhr = new XMLHttpRequest()
  // use sync to avoid popup blocker
  xhr.open('HEAD', url, false)
  try {
    xhr.send()
  } catch (e: any) {
    throw new Error(e)
  }
  return xhr.status >= 200 && xhr.status <= 299
}

// `a.click()` doesn't work for all browsers (#465)
function click(node: Node) {
  try {
    node.dispatchEvent(new MouseEvent('click'))
  } catch (e) {
    const evt: any = document.createEvent('MouseEvents')
    evt.initMouseEvent('click', true, true, window, 0, 0, 0, 80, 20, false, false, false, false, 0, null)
    node.dispatchEvent(evt)
  }
}

function download(url: string, name: string, opts: Object) {
  const xhr = new XMLHttpRequest()
  xhr.open('GET', url)
  xhr.responseType = 'blob'
  xhr.onload = () => {
    saveAs(xhr.response, name, opts)
  }
  xhr.onerror = () => {
    throw new Error('could not download file')
  }
  xhr.send()
}
const saveAs: any =
  _global?.saveAs ||
  // probably in some web worker
  (typeof window !== 'object' || window !== _global
    ? function saveAs() {
        /* noop */
      }
    : // Use download attribute first if possible (#193 Lumia mobile) unless this is a macOS WebView
    'download' in HTMLAnchorElement.prototype && !isMacOSWebView
    ? function saveAs(blob: Blob & { name: string }, name: string, opts: Object) {
        const URL: any = _global.URL || _global.webkitURL
        const a = document.createElement('a')
        name = name || blob.name || 'download'

        a.download = name
        a.rel = 'noopener' // tabnabbing

        // TODO: detect chrome extensions & packaged apps
        // a.target = '_blank'

        if (typeof blob === 'string') {
          // Support regular links
          a.href = blob
          if (a.origin !== window.location.origin) {
            if (corsEnabled(a.href)) {
              download(blob, name, opts)
            } else {
              a.target = '_blank'
              click(a)
            }
          } else {
            click(a)
          }
        } else {
          // Support blobs
          a.href = URL.createObjectURL(blob)
          setTimeout(() => {
            URL.revokeObjectURL(a.href)
          }, 4e4) // 40s
          setTimeout(() => {
            click(a)
          }, 0)
        }
      }
    : // Use msSaveOrOpenBlob as a second approach
    'msSaveOrOpenBlob' in navigator
    ? function saveAs(blob: Blob & { name: string }, name: string, opts: Object) {
        name = name || blob.name || 'download'

        if (typeof blob === 'string') {
          if (corsEnabled(blob)) {
            download(blob, name, opts)
          } else {
            const a = document.createElement('a')
            a.href = blob
            a.target = '_blank'
            setTimeout(() => {
              click(a)
            })
          }
        } else {
          /* @ts-ignore deprecated */
          navigator.msSaveOrOpenBlob(bom(blob, opts), name)
        }
      }
    : // Fallback to using FileReader and a popup
      function saveAs(blob: Blob, name: string, opts: Object, popup: any) {
        // Open a popup immediately do go around popup blocker
        // Mostly only available on user interaction and the fileReader is async so...
        popup = popup || window.open('', '_blank')
        if (popup) {
          popup.document.title = 'downloading...'
          popup.document.body.innerText = 'downloading...'
        }

        if (typeof blob === 'string') return download(blob, name, opts)

        const force = blob.type === 'application/octet-stream'
        const isSafari = /constructor/i.test(_global.HTMLElement) || _global.safari
        const isChromeIOS = /CriOS\/[\d]+/.test(navigator.userAgent)

        if ((isChromeIOS || (force && isSafari) || isMacOSWebView) && typeof FileReader !== 'undefined') {
          // Safari doesn't allow downloading of blob URLs
          const reader = new FileReader()
          reader.onloadend = () => {
            let url: any = reader.result
            url = isChromeIOS ? url : url.replace(/^data:[^;]*;/, 'data:attachment/file;')
            if (popup) popup.location.href = url
            else window.location.href = url
            popup = null // reverse-tabnabbing #460
          }
          reader.readAsDataURL(blob)
        } else {
          const URL = _global.URL || _global.webkitURL
          const url = URL.createObjectURL(blob)
          if (popup) popup.location = url
          else window.location.href = url
          popup = null // reverse-tabnabbing #460
          setTimeout(() => {
            URL.revokeObjectURL(url)
          }, 4e4) // 40s
        }
      })

// eslint-disable-next-line no-multi-assign
if (_global) _global.saveAs = saveAs.saveAs = saveAs

export default saveAs
