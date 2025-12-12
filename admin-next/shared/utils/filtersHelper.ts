/**
 * Returns true if all filters are null, false otherwise.
 * @returns {boolean} whether all filters are null
 */
const checkIfAllFiltersAreNull = (filters: Record<string, any>) => {
  return Object.values(filters).every(filter => filter === null)
}

export { checkIfAllFiltersAreNull }
