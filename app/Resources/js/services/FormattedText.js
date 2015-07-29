class FormattedText {

  strip(text) {
    if (text) {
      return text.replace('</p>', '\n').replace(/(<([^>]+)>)/ig, '');
    }
    return null;
  }

}

export default new FormattedText();
