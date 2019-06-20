declare module 'deep-object-diff' {
  declare export function diff (originalObj: any, updatedObj: any): any

  declare export function addedDiff (originalObj: any, updatedObj: any): any

  declare export function deletedDiff (originalObj: any, updatedObj: any): any

  declare export function updatedDiff (originalObj: any, updatedObj: any): any

  declare export function detailedDiff (originalObj: any, updatedObj: any): any

}
