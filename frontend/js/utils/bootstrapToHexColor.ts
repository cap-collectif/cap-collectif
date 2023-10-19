export const bootstrapToHex = (key: string) => {
  switch (key) {
    case 'WARNING':
      return '#f0ad4e'

    case 'INFO':
      return '#5bc0de'

    case 'SUCCESS':
      return '#5cb85c'

    case 'DANGER':
      return '#d9534f'

    default:
      console.warn('unknown bootstrap color: ', key)

      return '#000'
  }
}
