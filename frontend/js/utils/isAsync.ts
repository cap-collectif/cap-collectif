export const isAsync = (func: any) => {
  if (typeof func !== 'function') return false
  if ('then' in func) return true
  if (typeof func.then === 'function' && func[Symbol.toStringTag] === 'Promise') return true
  if (func.constructor.name === 'AsyncFunction') return true
  const string = func.toString().trim()
  return !!(string.match(/(^async|async*|Promise)/) || string.match(/return _ref[^.]*\.apply/))
}
