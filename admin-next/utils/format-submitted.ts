const formatSubmitted = <T extends { value: string }>(arr?: T | Array<T>): Array<string> => {
  return arr ? (Array.isArray(arr) ? [...arr.map(elem => elem.value)] : [arr.value]) : []
}
export default formatSubmitted
