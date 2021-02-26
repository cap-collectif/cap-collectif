// @flow
import Flux from 'flux';

/**
 * @deprecated This is out legacy Flux dispatcher, do not use it.
 */
export default (new Flux.Dispatcher(): {
  dispatch: ({|
    actionType?: string,
    type?: string,
    payload?: Object,
    alert?: {|
      type?: string,
      values?: Object,
      extraContent?: any,
      bsStyle?: string,
      content: string,
    |},
  |}) => void,
  register: Function,
});
