class ArrayHelper {

  getElementIndexFromArray(els, el, uniqueField = 'id') {
    let index = -1;
    index = els.map((e) => {
      return e[uniqueField];
    }).indexOf(el[uniqueField]);
    return index;
  }

  addElementToArray(els, el, uniqueField = 'id') {
    const index = this.getElementIndexFromArray(els, el, uniqueField);
    if (index === -1) {
      els.push(el);
    }
    return els;
  }

  removeElementFromArray(els, el, uniqueField = 'id') {
    const index = this.getElementIndexFromArray(els, el, uniqueField);
    if (index > -1) {
      els.splice(index, 1);
    }
    return els;
  }
}

export default new ArrayHelper();
