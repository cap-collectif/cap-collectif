const getNodes = str => {
  const doc = new window.DOMParser().parseFromString(str, 'text/html')
  return [...Array.from(doc.head.childNodes), ...Array.from(doc.body.childNodes)]
}

const evalInlineScript = (code: string, retries = 1) => {
  try {
    // eslint-disable-next-line no-eval
    window.eval(code)
  } catch (error) {
    if (retries > 0) {
      window.setTimeout(() => evalInlineScript(code, retries - 1), 0)
      return
    }

    // eslint-disable-next-line no-console
    console.error('Invalid custom code:', error, code)
  }
}

export const evalCustomCode = (code?: string | null | undefined) => {
  if (typeof document === 'undefined') return

  if (code) {
    const nodes = getNodes(code.trim().startsWith('<') ? code : formatCustomCode(code))

    for (const node of nodes) {
      if (!(node instanceof HTMLElement)) continue

      if (node.tagName === 'SCRIPT') {
        const script = node as HTMLScriptElement
        if (script.textContent) evalInlineScript(script.textContent)
        else if (script.src) {
          const scriptEle = document.createElement('script')
          scriptEle.setAttribute('src', script.src)
          scriptEle.setAttribute('type', 'text/javascript')
          scriptEle.setAttribute('async', script.async ? 'true' : 'false')
          document?.body?.appendChild(scriptEle)
          scriptEle.addEventListener('error', ev => {
            // eslint-disable-next-line no-console
            console.error('Error on loading file', ev)
          })
        }
      } else if (['STYLE', 'LINK'].includes(node.tagName)) {
        document.head.appendChild(node.cloneNode(true))
      }
    }
  }
}

export const formatCustomCode = (code?: string | null | undefined) => {
  if (!code || !code?.length) return null
  if (code.includes('<script')) {
    return code
  } else return `<script>${code}</script>`
}
