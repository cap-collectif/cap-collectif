// @flow
import { Diff } from 'diff';

function removeEmpty(array) {
  const ret = [];
  for (let i = 0; i < array.length; i++) {
    if (array[i]) {
      ret.push(array[i]);
    }
  }
  return ret;
}

function strip(value) {
  return value
    .replace(/<p>/g, '')
    .replace(/<\/p>/g, '<parend>')
    .replace(/(\r\n|\n|\r)/gm, '');
}

function everythingHasChanged(diff) {
  const changed = diff.every(part => part.added || part.removed || part.value === ' ');
  return !!changed;
}

class CustomDiff extends Diff {
  tokenize(value) {
    let strippedValue = strip(value);
    strippedValue = strippedValue.replace(/(<parend>)/g, '|$1|');
    strippedValue = strippedValue.replace(/(&nbsp;)/g, '|$1|');
    strippedValue = strippedValue.replace(/(<br \/>)/g, '|$1|');
    strippedValue = strippedValue.replace(/(\s+?)(?=.+?)/g, '|$1|');
    return removeEmpty(strippedValue.split('|'));
  }

  pDiff(oldValue, newValue) {
    let prettyDiff = '';
    // Compute diff
    const oldV = $('<div/>')
      .text(oldValue)
      .html();
    const newV = $('<div/>')
      .text(newValue)
      .html();
    const diff = this.diff(oldV, newV);
    // All text has been replaced
    if (everythingHasChanged(diff)) {
      return `<del style="color: red; text-decoration: line-through">${oldValue}</del><ins style="color: green;">${newValue}</ins>`;
    }
    // Add style
    diff.forEach(part => {
      const diffColor = part.added ? 'green' : part.removed ? 'red' : 'grey';
      const decoration = part.removed ? 'line-through' : 'none';
      const htmlTag = part.removed ? 'del' : part.added ? 'ins' : 'span';
      const open = `<${htmlTag} style="color: ${diffColor}; text-decoration: ${decoration}">`;
      const close = `</${htmlTag}>`;
      const content = part.value.replace(/<parend>/g, `${close}<parend>${open}`);
      const styledPart = open + content + close;
      prettyDiff += styledPart;
    });
    // Put <p> back
    return `<p>${prettyDiff.replace(/<parend>/g, '</p><p>')}</p>`;
  }
}

export default new CustomDiff();
