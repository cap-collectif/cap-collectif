import Flux from 'flux'
/**
 * @deprecated This is out legacy Flux dispatcher, do not use it.
 */

export default new Flux.Dispatcher() as {
  dispatch: (arg0: {
    actionType?: string
    type?: string
    payload?: Record<string, any>
    alert?: {
      type?: string
      values?: Record<string, any>
      extraContent?: any
      bsStyle?: string
      content: string
    }
  }) => void
  register: (...args: Array<any>) => any
}
