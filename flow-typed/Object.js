// Fix Object.entries()/Object.values() to behave as expected. This is potentially unsound because of two reasons:
// 1. Flow allows an object to have more properties on runtime than declared in the type (also known as sub-typing).
// 2. The prototype chain is not included.
// However, it works fine as long as the used objects have no prototype chain and
// have no additional value types on runtime. Since we use Object.entries()/Object.values() only in situations
// where objects are used as map
// See also https://github.com/facebook/flow/pull/5663#issuecomment-357593210
// See also https://github.com/facebook/flow/blob/v0.63.1/lib/core.js#L25
declare class Object {
  static entries<T: Object>(object: T): Array<[$Keys<T>, $Values<T>]>;
  static values<T: Object>(object: T): Array<$Values<T>>;
  static assign: Object$Assign;
  hasOwnProperty(prop: any): boolean;
  isPrototypeOf(o: any): boolean;
  propertyIsEnumerable(prop: any): boolean;
  toLocaleString(): string;
  toString(): string;
  valueOf(): Object;
}
