/* global Image */
export function rgb2hex(rgb: string): string {
  if (!rgb) return ''
  const rgbMatch = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i)
  return rgbMatch && rgbMatch.length === 4
    ? `#${`0${parseInt(rgbMatch[1], 10).toString(16)}`.slice(-2)}${`0${parseInt(rgbMatch[2], 10).toString(16)}`.slice(
        -2,
      )}${`0${parseInt(rgbMatch[3], 10).toString(16)}`.slice(-2)}`
    : ''
}
export function getNodeAttributes(node: HTMLElement): Record<string, any> {
  const attributes = {}

  // Store all attributes of the node
  if (node.attributes) {
    // node.attributes is a NamedNodeMap non-iterable with map()
    // see: https://developer.mozilla.org/fr/docs/Web/API/NamedNodeMap
    for (let i = 0, len = node.attributes.length; i < len; i++) {
      attributes[node.attributes[i].name] = node.attributes[i].value
    }
  }

  return attributes
}
export function getStyleProp(inlineStyle: string): Record<string, any> {
  const result = {}
  const properties = inlineStyle.split(';')
  properties.forEach(property => {
    // Remove extra space before split
    const [key, value] = property.trim().replace(': ', ':').split(':')

    if (value) {
      // Convert key in camel case
      const formattedKey = key.replace(/-([a-z])/g, g => g[1].toUpperCase())
      result[formattedKey] = value
    }
  })
  return result
}
export function getImageInitialSize(url: string) {
  return new Promise<{
    width: number
    height: number
  }>((resolve, reject) => {
    const img = new Image()

    img.onload = () =>
      resolve({
        width: img.width,
        height: img.height,
      })

    img.onerror = reject
    img.src = url
  })
}
