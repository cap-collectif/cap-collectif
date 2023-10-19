class FormattedText {
  strip(text: string | null | undefined) {
    if (text) {
      return text.replace('</p>', '\n').replace(/(<([^>]+)>)/gi, '')
    }

    return null
  }
}

export default new FormattedText()
