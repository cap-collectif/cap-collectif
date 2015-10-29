class ArrayHelper {

  getElementIndexFromArray(els, el, uniqueField = 'id', secondUniqueField = null) {
    let index = -1;
    const valueToCheck = secondUniqueField ? el[uniqueField][secondUniqueField] : el[uniqueField];
    index = els.map((e) => {
      return secondUniqueField ? e[uniqueField][secondUniqueField] : e[uniqueField];
    }).indexOf(valueToCheck);
    return index;
  }

  addElementToArray(els, el, uniqueField = 'id', secondUniqueField = null) {
    const index = this.getElementIndexFromArray(els, el, uniqueField, secondUniqueField);
    if (index === -1) {
      els.push(el);
    }
    return els;
  }

  removeElementFromArray(els, el, uniqueField = 'id', secondUniqueField = null) {
    const index = this.getElementIndexFromArray(els, el, uniqueField, secondUniqueField);
    if (index > -1) {
      els.splice(index, 1);
    }
    return els;
  }

  sortArrayByField(els, field = 'title') {
    return els.sort((el1, el2) => {
      return el1[field] < el2[field] ? 1 : -1;
    });
  }
}

export default new ArrayHelper();
