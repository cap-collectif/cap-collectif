const formatSubmitted = (arr?: any) => {
  return arr ? (Array.isArray(arr) ? [...arr.map(elem => elem.value)] : [arr.value]) : []
}

export default formatSubmitted
