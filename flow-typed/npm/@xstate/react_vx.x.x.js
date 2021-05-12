declare module '@xstate/react' {
  declare export function useActor<T,U>(actor: any): [T, (U) => void]
  declare export function useMachine<T>(Machine: T):
  { current: Object, send: Function, service: Function };

}
