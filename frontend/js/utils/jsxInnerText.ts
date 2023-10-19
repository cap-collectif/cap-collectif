function hasProps(jsx: JSX.Element | JSX.Element[] | string) {
  return Object.prototype.hasOwnProperty.call(jsx, 'props')
}

function jsxInnerText(jsx?: JSX.Element | JSX.Element[] | string): string {
  if (jsx === null || typeof jsx === 'boolean' || typeof jsx === 'undefined') {
    return ''
  }

  if (typeof jsx === 'number') {
    // @ts-ignore
    return jsx.toString()
  }

  if (typeof jsx === 'string') {
    return jsx
  }

  if (Array.isArray(jsx)) {
    return jsx.reduce<string>((acc, node) => acc + jsxInnerText(node), '')
  }

  if (hasProps(jsx) && Object.prototype.hasOwnProperty.call((jsx as any).props, 'children')) {
    return jsxInnerText((jsx as any).props.children)
  }

  return ''
}

export default jsxInnerText
