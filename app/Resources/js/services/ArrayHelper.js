// @flow
class ArrayHelper {
  getElementIndexFromArray(els, el, uniqueField = 'id', secondUniqueField = null) {
    let index = -1;
    const valueToCheck = secondUniqueField ? el[uniqueField][secondUniqueField] : el[uniqueField];
    index = els
      .map(e => (secondUniqueField ? e[uniqueField][secondUniqueField] : e[uniqueField]))
      .indexOf(valueToCheck);
    return index;
  }

  getElementFromArray(els, value, uniqueField = 'id', secondUniqueField = null) {
    let index = -1;
    index = els
      .map(e => (secondUniqueField ? e[uniqueField][secondUniqueField] : e[uniqueField]))
      .indexOf(value);
    return els[index];
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

  sortArrayByField(els, sortField = 'title', naturalSorting = false, sortOrder = 'ASC') {
    let field = sortField;
    let order = sortOrder;
    let nsort = naturalSorting;
    return els.sort((el1, el2) => {
      if (el1[field] === 'undefined' || el1[field] === null) {
        return -1;
      }
      if (el2[field] === 'undefined' || el2[field] === null) {
        return 1;
      }
      // We never do want to sort contributions by children number
      if (field === 'childrenElementsNb' && el1.displayType === 'contribution') {
        field = 'title';
        order = 'ASC';
        nsort = true;
      }
      if (order === 'ASC') {
        return nsort
          ? this.naturalComparison(el1[field], el2[field])
          : el1[field] > el2[field]
          ? 1
          : -1;
      }
      if (order === 'DESC') {
        return nsort
          ? this.naturalComparison(el2[field], el1[field])
          : el1[field] < el2[field]
          ? 1
          : -1;
      }
      return 0;
    });
  }

  naturalComparison(as, bs) {
    const rx = /(\d+)|(\D+)/g;
    const rd = /\d+/;
    const a = String(as)
      .toLowerCase()
      .match(rx);
    const b = String(bs)
      .toLowerCase()
      .match(rx);
    while (a.length && b.length) {
      const a1 = a.shift();
      const b1 = b.shift();
      if (rd.test(a1) || rd.test(b1)) {
        if (!rd.test(a1)) return 1;
        if (!rd.test(b1)) return -1;
        if (a1 !== b1) return a1 - b1;
      } else if (a1 !== b1) return a1 > b1 ? 1 : -1;
    }
    return a.length - b.length;
  }
}

export default new ArrayHelper();
