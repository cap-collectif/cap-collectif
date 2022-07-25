export function toGlobalId(type: string, id: string) {
  return window.btoa(`${type}:${id}`)
}
