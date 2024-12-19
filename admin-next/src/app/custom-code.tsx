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
          window.eval(node.innerText)
        }
      }
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Invalid custom code', code)
  }
}
