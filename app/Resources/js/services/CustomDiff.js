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
  return value.replace(/<p>/g, '').replace(/<\/p>/g, '<parend>').replace(/(\r\n|\n|\r)/gm, '');
}

function everythingHasChanged(diff) {
  const changed = diff.every(function changed(part) {
    if (!part.added && !part.removed && part.value !== ' ') {
      return false;
    }
    return true;
  });
  return !!changed;
}

function escapeChars(text) {
  return text
    .replace(/è/g,'&egrave;')
    .replace(/é/g,'&eacute;')
    .replace(/’/g, '&rsquo;')
    .replace(/'/g, '&#39;')
    .replace(/à/g, '&agrave;')
    .replace(/«/g, '&laquo;')
    .replace(/°/g, '&deg;')
    .replace(/»/g, '&raquo;')
    ;
}

class CustomDiff extends JsDiff.Diff {

  tokenize = function tokenize(value) {
    let strippedValue = strip(value);
    strippedValue = strippedValue.replace(/(<parend>)/g, '|$1|');
    strippedValue = strippedValue.replace(/(&nbsp;)/g, '|$1|');
    strippedValue = strippedValue.replace(/(<br>)/g, '|$1|');
    strippedValue = strippedValue.replace(/(\s+?)(?=.+?)/g, '|$1|');
    return removeEmpty(strippedValue.split('|'));
  };

  prettyDiff = function pDiff(oldValue, newValue) {
    let prettyDiff = '';
    // Compute diff
    console.log(oldValue);
    console.log(newValue);
    const diff = this.diff(escapeChars(oldValue), escapeChars(newValue));
    // All text has been replaced
    if (everythingHasChanged(diff)) {
      return '<div style="color: red; text-decoration: line-through">' + oldValue + '</div>'
        + '<div style="color: green;">' + newValue + '</div>';
    }
    // Add style
    diff.forEach((part) => {
      const diffColor = part.added ? 'green' : part.removed ? 'red' : 'grey';
      const decoration = part.removed ? 'line-through' : 'none';
      const open = '<span style="color: ' + diffColor + '; text-decoration: ' + decoration + '">';
      const close = '</span>';
      const content = part.value.replace(/<parend>/g, close + '<parend>' + open);
      const styledPart = open + content + close;
      prettyDiff += styledPart;
    });
    // Put <p> back
    return '<p>' + prettyDiff.replace(/<parend>/g, '</p><p>') + '</p>';
  }

}

export default new CustomDiff();
