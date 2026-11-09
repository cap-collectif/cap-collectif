// @ts-nocheck
const getNodes = str => new window.DOMParser().parseFromString(str, 'text/html').head.childNodes

// Scripts parsed by DOMParser are inert: recreate them so the browser downloads external sources.
const loadExternalScript = (source: HTMLScriptElement, container: HTMLElement) => {
  const script = document.createElement('script')

  for (const { name, value } of Array.from(source.attributes)) {
    script.setAttribute(name, value)
  }

  script.addEventListener('error', event => {
    // eslint-disable-next-line no-console
    console.error('Error on loading file', event)
  })
  container.appendChild(script)
}

export const insertCustomCode = (code?: string | null | undefined, id?: string = 'capcoCustomCodeWrapper') => {
  if (!document) return

  let customCode = document.getElementById(id)

  if (!customCode) {
    customCode = document.createElement('div')
    customCode.setAttribute('id', id)
    if (document.body) document.body.appendChild(customCode)
  }

  customCode.innerHTML = ''

  if (code) {
    const nodes = Array.from(getNodes(code))

    for (const node of nodes) {
      if (node.nodeType === 1) {
        if (node.tagName === 'SCRIPT') {
          if (node.src) loadExternalScript(node, customCode)
          // eslint-disable-next-line no-eval
          else window.eval(node.innerText)
        } else if (node.tagName === 'STYLE') {
          customCode.appendChild(node)
        }
      }
    }
  }
}
