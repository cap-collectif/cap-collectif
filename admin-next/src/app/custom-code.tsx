const getNodes = str => new window.DOMParser().parseFromString(str, 'text/html').head.childNodes

export const evalCustomCode = (code?: string | null | undefined) => {
  if (!document) return

  try {
    if (code) {
      const nodes = getNodes(code)

      // @ts-ignore
      for (const node of nodes) {
        if (node.nodeType === 1 && node.tagName === 'SCRIPT') {
          // eslint-disable-next-line no-eval
          if (node.innerText) window.eval(node.innerText)
          else if (node.src) {
            const scriptEle = document.createElement('script')
            scriptEle.setAttribute('src', node.src)
            scriptEle.setAttribute('type', 'text/javascript')
            scriptEle.setAttribute('async', node.async ? 'true' : 'false')
            document?.body?.appendChild(scriptEle)
            scriptEle.addEventListener('error', ev => {
              // eslint-disable-next-line no-console
              console.error('Error on loading file', ev)
            })
          }
        }
      }
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Invalid custom code', code)
  }
}

export const formatCustomCode = (code?: string | null | undefined) => {
  if (!code || !code?.length) return null
  if (code.includes('<script>')) {
    return code
  } else return `<script>${code}</script>`
}
