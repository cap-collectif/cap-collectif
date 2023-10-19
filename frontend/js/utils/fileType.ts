const fileType = (format: string | Array<string>): string | Array<string> => {
  if (Array.isArray(format)) {
    if (format.length > 0) {
      return format.map((elem: string) => {
        if (/^(.+?)\//.test(elem)) {
          return elem.split('/')[0]
        }

        if (/^\./.test(elem)) {
          return elem.split('.')[1]
        }

        return elem
      })
    }

    return format
  }

  if (/^(.+?)\//.test(format)) {
    return format.split('/')[0]
  }

  if (/^\./.test(format)) {
    return format.split('.')[1]
  }

  return format
}

export default fileType
