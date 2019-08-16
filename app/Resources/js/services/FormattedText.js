// @flow
class FormattedText {
  strip(text) {
    if (text) {
      return text.replace('</p>', '\n').replace(/(<([^>]+)>)/gi, '');
    }
    return null;
  }
}

export default new FormattedText();
