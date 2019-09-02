// @flow
import type { Dispatch } from 'redux';

type GetFormErrorInterface = (state: any) => any

type OnChangeFunction = (
  values: Values,
  dispatch: Dispatch<*>,
  props: Object,
  previousValues: Values,
) => void
type OnSubmitFail = (
  errors: ?Object,
  dispatch: Dispatch<*>,
  submitError: ?any,
  props: Object,
) => void
type OnSubmitSuccess = (
  result: ?any,
  dispatch: Dispatch<*>,
  props: Object,
) => void
type OnSubmitFunction = (
  values: Values,
  dispatch: Dispatch<*>,
  props: Object,
) => Promise<*> | void

type ReduxFormEvent = {
  preventDefault(): void,
  stopPropagation(): void,
  target: {
    value: any,
    type: string,
    options?: Array<Option>,
    checked?: boolean,
    files?: Array<Object>
  },
  dataTransfer: {
    files: Array<Object>,
    getData: { (key: string): any },
    setData: { (key: string, data: any): void }
  },
  nativeEvent?: {
    text?: string
  }
};

type Validator = (
  value: any,
  allValues: Object,
  props: Object,
  name: string,
) => ?any

interface Structure<M, L> {
  allowsArrayErrors: boolean;
  empty: M;
  emptyList: L;

  getIn(state: any, field: string): any;

  setIn(state: any, field: string, value: any): any;

  deepEqual(a: any, b: any): boolean;

  deleteIn(state: any, field: string): any;

  forEach(list: L, callback: { (item: any, index: number): void }): void;

  fromJS(value: any): any;

  keys(value: M): L;

  size(array: L): number;

  some(list: L, callback: { (item: any, index: number): boolean }): boolean;

  splice(array: L, index: number, removeNum: number, value: any): L;

  toJS(value: M): any;
}

type FieldType = 'Field' | 'FieldArray'

type Values = any

type GetFormState = { (state: any): any }

type Option = {
  selected: boolean,
  value: any
}

/*
type Context = {
  form: string,
  getFormState: GetFormState,
  asyncValidate: { (name: ?string, value: ?any, trigger: 'blur' | 'change'): Promise<*> },
  getValues: { (): Object },
  sectionPrefix?: string,
  register: (
    name: string,
    type: string,
    getValidator: ?() => ?(Validator | Validator[]),
    getWarner: ?() => ?(Validator | Validator[]),
  ) => void,
  unregister: (name: string) => void,
  registerInnerOnSubmit: (innerOnSubmit: Function) => void,
  focus: (name: string) => void,
  change: (name: string, value: any) => void,
  blur: (name: string, value: any) => void
}*/

type ReactContext = {
  _reduxForm: any //Context
}

type GetFormNamesInterface<L> = (state: any) => L

type Fields = {
  _isFieldArray: boolean,
  forEach(callback: Function): void,
  get(index: number): any,
  getAll(): Array<any>,
  insert(index: number, value: any): void,
  length: number,
  map(callback: Function): Array<any>,
  move(from: number, to: number): void,
  name: string,
  pop(): any,
  push(value: any): void,
  reduce(callback: Function): any,
  remove(index: number): void,
  removeAll(): void,
  shift(): any,
  some(callback: Function): boolean,
  swap(from: number, to: number): void,
  unshift(value: any): void
}

export type ArrayInsertAction = {
  type: '@@redux-form/ARRAY_INSERT',
  meta: { form: string, field: string, index: number },
  payload: any
}
export type ArrayInsert = {
  (form: string, field: string, index: number, value: any): ArrayInsertAction
}
export type ArrayMoveAction = {
  type: '@@redux-form/ARRAY_MOVE',
  meta: { form: string, field: string, from: number, to: number }
}
export type ArrayMove = {
  (form: string, field: string, from: number, to: number): ArrayMoveAction
}
export type ArrayPopAction = {
  type: '@@redux-form/ARRAY_POP',
  meta: { form: string, field: string }
}
export type ArrayPop = { (form: string, field: string): ArrayPopAction }
export type ArrayPushAction = {
  type: '@@redux-form/ARRAY_PUSH',
  meta: { form: string, field: string },
  payload: any
}
export type ArrayPush = {
  (form: string, field: string, value: any): ArrayPushAction
}
export type ArrayRemoveAction = {
  type: '@@redux-form/ARRAY_REMOVE',
  meta: { form: string, field: string, index: number }
}
export type ArrayRemove = {
  (form: string, field: string, index: number): ArrayRemoveAction
}
export type ArrayRemoveAllAction = {
  type: '@@redux-form/ARRAY_REMOVE_ALL',
  meta: { form: string, field: string }
}
export type ArrayRemoveAll = {
  (form: string, field: string): ArrayRemoveAllAction
}
export type ArrayShiftAction = {
  type: '@@redux-form/ARRAY_SHIFT',
  meta: { form: string, field: string }
}
export type ArrayShift = { (form: string, field: string): ArrayShiftAction }
export type ArraySpliceAction = {
  type: '@@redux-form/ARRAY_SPLICE',
  meta: {
    form: string,
    field: string,
    index: number,
    removeNum: number
  },
  payload?: any
}
export type ArraySplice = {
  (
    form: string,
    field: string,
    index: number,
    removeNum: number,
    value: any,
  ): ArraySpliceAction
}
export type ArraySwapAction = {
  type: '@@redux-form/ARRAY_SWAP',
  meta: { form: string, field: string, indexA: number, indexB: number }
}
export type ArraySwap = {
  (form: string, field: string, indexA: number, indexB: number): ArraySwapAction
}
export type ArrayUnshiftAction = {
  type: '@@redux-form/ARRAY_UNSHIFT',
  meta: { form: string, field: string },
  payload: any
}
export type ArrayUnshift = {
  (form: string, field: string, value: any): ArrayUnshiftAction
}
export type AutofillAction = {
  type: '@@redux-form/AUTOFILL',
  meta: { form: string, field: string },
  payload: any
}
export type Autofill = {
  (form: string, field: string, value: any): AutofillAction
}
export type BlurAction = {
  type: '@@redux-form/BLUR',
  meta: { form: string, field: string, touch: boolean },
  payload: any
}
export type Blur = {
  (form: string, field: string, value: any, touch: boolean): BlurAction
}
export type ChangeAction = {
  type: '@@redux-form/CHANGE',
  meta: {
    form: string,
    field: string,
    touch: ?boolean,
    persistentSubmitErrors: ?boolean
  },
  payload: any
}
export type Change = {
  (
    form: string,
    field: string,
    value: any,
    touch?: boolean,
    persistentSubmitErrors?: boolean,
  ): ChangeAction
}
export type ClearSubmitAction = {
  type: '@@redux-form/CLEAR_SUBMIT',
  meta: { form: string }
}
export type ClearSubmit = { (form: string): ClearSubmitAction }
export type ClearSubmitErrorsAction = {
  type: '@@redux-form/CLEAR_SUBMIT_ERRORS',
  meta: { form: string }
}
export type ClearSubmitErrors = { (form: string): ClearSubmitErrorsAction }
export type ClearAsyncErrorAction = {
  type: '@@redux-form/CLEAR_ASYNC_ERROR',
  meta: { form: string, field: string }
}
export type ClearAsyncError = {
  (form: string, field: string): ClearAsyncErrorAction
}
// export type ClearFieldsAction = {
//   type: string,
//   meta: {
//     form: string,
//     keepTouched: boolean,
//     persistentSubmitErrors: boolean,
//     fields: string[]
//   }
// }
// export type ClearFields = {
//   (
//     form: string,
//     keepTouched: boolean,
//     persistentSubmitErrors: boolean,
//     ...fields: string[]
//   ): ClearFieldsAction
// }
export type DestroyAction = { type: '@@redux-form/DESTROY', meta: { form: string[] } }
export type Destroy = { (...forms: string[]): DestroyAction }
export type FocusAction = {
  type: '@@redux-form/FOCUS',
  meta: { form: string, field: string }
}
export type Focus = { (form: string, field: string): FocusAction }
export type InitializeAction = {
  type: '@@redux-form/INITIALIZE',
  meta: { form: string, keepDirty: boolean },
  payload: Object
}
export type Initialize = {
  (
    form: string,
    values: Object,
    keepDirty: boolean,
    otherMeta: Object,
  ): InitializeAction
}
export type RegisterFieldAction = {
  type: '@@redux-form/REGISTER_FIELD',
  meta: { form: string },
  payload: { name: string, type: FieldType }
}
export type RegisterField = {
  (form: string, name: string, type: FieldType): RegisterFieldAction
}
export type ResetAction = { type: '@@redux-form/RESET', meta: { form: string } }
export type Reset = { (form: string): ResetAction }
export type StartAsyncValidationAction = {
  type: '@@redux-form/START_ASYNC_VALIDATION',
  meta: { form: string, field: string }
}
export type StartAsyncValidation = {
  (
    form: string,
    field: string,
    index: number,
    value: any,
  ): StartAsyncValidationAction
}
export type StartSubmitAction = {
  type: '@@redux-form/START_SUBMIT',
  meta: { form: string }
}
export type StartSubmit = { (form: string): StartSubmitAction }
export type StopAsyncValidationAction = {
  type: '@@redux-form/STOP_ASYNC_VALIDATION',
  meta: { form: string },
  payload: ?Object,
  error: boolean
}
export type StopAsyncValidation = {
  (form: string, errors: ?Object): StopAsyncValidationAction
}
export type StopSubmitAction = {
  type: '@@redux-form/STOP_SUBMIT',
  meta: { form: string },
  payload: ?Object,
  error: boolean
}
export type StopSubmit = { (form: string, errors: ?Object): StopSubmitAction }
export type SubmitAction = {| type: '@@redux-form/SUBMIT', meta: { form: string } |}
export type Submit = { (form: string): SubmitAction }
export type SetSubmitFailedAction = {
  type: '@@redux-form/SET_SUBMIT_FAILED',
  meta: { form: string, fields: string[] },
  error: true
}
export type SetSubmitFailed = {
  (form: string, ...fields: string[]): SetSubmitFailedAction
}
export type SetSubmitSucceededAction = {
  type: '@@redux-form/SET_SUBMIT_SUCCEEDED',
  meta: { form: string, fields: string[] },
  error: false
}
export type SetSubmitSucceeded = {
  (form: string, ...fields: string[]): SetSubmitSucceededAction
}
export type TouchAction = {
  type: '@@redux-form/TOUCH',
  meta: { form: string, fields: string[] }
}
export type Touch = { (form: string, ...fields: string[]): TouchAction }
export type UnregisterFieldAction = {
  type: '@@redux-form/UNREGISTER_FIELD',
  meta: { form: string },
  payload: { name: string, destroyOnUnmount: boolean }
}
export type UnregisterField = {
  (form: string, name: string, destroyOnUnmount: boolean): UnregisterFieldAction
}
export type UntouchAction = {
  type: '@@redux-form/UNTOUCH',
  meta: { form: string, fields: string[] }
}
export type Untouch = { (form: string, ...fields: string[]): UntouchAction }
export type UpdateSyncErrorsAction = {
  type: '@@redux-form/UPDATE_SYNC_ERRORS',
  meta: { form: string },
  payload: { syncErrors: Object, error: any }
}
export type UpdateSyncErrors = {
  (form: string, syncErrors: Object, error: any): UpdateSyncErrorsAction
}
export type UpdateSyncWarningsAction = {
  type: '@@redux-form/UPDATE_SYNC_WARNINGS',
  meta: { form: string },
  payload: { syncWarnings: Object, warning: any }
}
export type UpdateSyncWarnings = {
  (form: string, syncWarnings: Object, warning: any): UpdateSyncWarningsAction
}

type ValidateFunction = (values: Values, props: Object) => Object

type ReduxFormConfig = {
  asyncBlurFields?: string[],
  destroyOnUnmount?: boolean,
  forceUnregisterOnUnmount?: boolean,
  enableReinitialize?: boolean,
  keepDirtyOnReinitialize?: boolean,
  form?: string, // TODO mark as required
  initialValues?: Values,
  getFormState?: GetFormState,
  onChange?: OnChangeFunction,
  onSubmit?: OnSubmitFunction,
  onSubmitFail?: OnSubmitFail,
  onSubmitSuccess?: OnSubmitSuccess,
  propNamespace?: string,
  validate?: ValidateFunction,
  warn?: ValidateFunction,
  touchOnBlur?: boolean,
  touchOnChange?: boolean,
  persistentSubmitErrors?: boolean,
  registeredFields?: any
}

declare module 'redux-form' {

  declare export type Actions =
    ArrayInsertAction |
    ArrayMoveAction |
    ArrayPopAction |
    ArrayPushAction |
    ArrayRemoveAction |
    ArrayRemoveAllAction |
    ArrayShiftAction |
    ArraySpliceAction |
    ArraySwapAction |
    ArrayUnshiftAction |
    AutofillAction |
    BlurAction |
    ChangeAction |
    ClearSubmitAction |
    ClearSubmitErrorsAction |
    ClearAsyncErrorAction |
    // clearFields: ClearFields,
    DestroyAction |
    FocusAction |
    InitializeAction |
    RegisterFieldAction |
    ResetAction |
    StartAsyncValidationAction |
    StartSubmitAction |
    StopAsyncValidationAction |
    StopSubmitAction |
    SubmitAction |
    SetSubmitFailedAction |
    SetSubmitSucceededAction |
    TouchAction |
    UnregisterFieldAction |
    UntouchAction |
    UpdateSyncErrorsAction |
    UpdateSyncWarningsAction
    ;
  // modified by @liinkiing and adapted from typescript definitions files (https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/redux-form/lib/reducer.d.ts)
  // to allow usage of `formReducer.plugin` in `AppStore.js` and to reflect a more precise type than the default in flow typed
  declare type FormStateMap = {
    [formName: string]: FormState;
  }

  declare type FormState = {
    registeredFields: RegisteredFieldState[];
    fields?: { [name: string]: FieldState };
    values?: { [fieldName: string]: any };
    active?: string;
    anyTouched?: boolean;
    submitting?: boolean;
    submitErrors?: { [fieldName: string]: string };
    submitFailed?: boolean;
  }

  declare type RegisteredFieldState = {
    name: string;
    type: FieldType;
  }

  declare type FieldState = {
    active?: boolean;
    touched?: boolean;
    visited?: boolean;
  }
  declare type Reducer<S = any, A = any> = (state: S | void, action: A) => S;

  declare type FormReducer = Reducer<FormStateMap> & {
    plugin(reducers: any): Reducer<FormStateMap>;
  }
  declare export var reducer: FormReducer;

  declare export type FieldProps = {
    input: {
      checked?: boolean,
      name: string,
      onBlur: { (eventOrValue: ReduxFormEvent | any): void },
      onChange: { (eventOrValue: ReduxFormEvent | any): void },
      onDrop: { (event: ReduxFormEvent): void },
      onDragStart: { (event: ReduxFormEvent): void },
      onFocus: { (event: ReduxFormEvent): void },
      value: any
    },
    meta: {
      active: boolean,
      asyncValidating: boolean,
      autofilled: boolean,
      dirty: boolean,
      dispatch: Dispatch<*>,
      error?: any,
      form: string,
      initial?: any,
      invalid: boolean,
      pristine: boolean,
      submitting: boolean,
      submitFailed: boolean,
      touched: boolean,
      valid: boolean,
      visited: boolean,
      warning?: any
    },
    custom: {
      ref?: (ref: React.ElementRef<*>) => React.ElementRef<*>
    }
  };

  declare export var Field: React.ComponentType<{
    name: string,
    component: React.ComponentType<*> | Function | string,
    format?: ?(value: any, name: string) => ?string,
    normalize?: (
      value: any,
      previousValue: any,
      allValues: Object,
      previousAllValues: Object,
    ) => ?any,
    onBlur?: (event: ReduxFormEvent, newValue: any, previousValue: any) => void,
    onChange?: (event: ReduxFormEvent, newValue: any, previousValue: any) => void,
    onDragStart?: (event: ReduxFormEvent) => void,
    onDrop?: (event: ReduxFormEvent, newValue: any, previousValue: any) => void,
    onFocus?: (event: ReduxFormEvent) => void,
    parse?: (value: any, name: string) => any,
    props?: Object,
    validate?: Validator | Validator[],
    warn?: Validator | Validator[],
    withRef?: boolean
  }>;
  declare export var Fields: React.ComponentType<{
    names: string[],
    component: Function | React.ComponentType<*>,
    format?: (value: any, name: string) => ?any,
    parse?: (value: any, name: string) => ?any,
    props?: Object,
    withRef?: boolean
  }>;

  declare export type FieldArrayProps = {|
    fields: Fields,
    meta: {
      dirty: boolean,
      error?: any,
      form: string,
      invalid: boolean,
      pristine: boolean,
      submitting: boolean,
      submitFailed: boolean,
      touched: boolean,
      valid: boolean,
      warning?: any
    },
    ref?: (ref: ?React.Component<*, *>) => void
  |}


  declare export var FieldArray: React.ComponentType<{
    name: string,
    component: React.ComponentType<*> | Function,
    props?: Object,
    rerenderOnEveryChange?: boolean,
    validate?: (value: any, allValues: Object, props: Object) => ?any,
    warn?: (value: any, allValues: Object, props: Object) => ?any,
    withRef?: boolean
  }>;

  declare export type FormProps = {|
    anyTouched: boolean,
    array: {
      insert: (field: string, index: number, value: any) => void,
      move: (field: string, from: number, to: number) => void,
      pop: (field: string) => void,
      push: (field: string, value: any) => void,
      remove: (field: string, index: number) => void,
      removeAll: (field: string) => void,
      shift: (field: string) => void,
      splice: (
        field: string,
        index: number,
        removeNum: number,
        value: any,
      ) => void,
      swap: (field: string, indexA: number, indexB: number) => void,
      unshift: (field: string, value: any) => void
    },
    asyncValidate: () => void,
    asyncValidating: boolean,
    autofill: (field: string, value: any) => void,
    blur: (field: string, value: any) => void,
    change: (field: string, value: any) => void,
    clearAsyncError: (field: string) => void,
    clearSubmit: () => void,
    destroy: () => void,
    dirty: boolean,
    dispatch: Function,
    error: any,
    form: string,
    handleSubmit: (eventOrSubmit: any) => void | Promise<*>,
    initialize: (data: Object) => void,
    initialized: boolean,
    initialValues: Object,
    invalid: boolean,
    pristine: boolean,
    reset: () => void,
    submitting: boolean,
    submitFailed: boolean,
    submitSucceeded: boolean,
    touch: (...fields: string[]) => void,
    untouch: (...fields: string[]) => void,
    valid: boolean,
    warning: any
  |}

  declare export function formValueSelector(
    form: string,
    getFormState: ?GetFormState,
  ): (state: any, ...fields: string[]) => any

  declare export function formValues(
    firstArg: string | Object,
    ...rest: string[]
  ): {
    (firstArg: string | Object, ...rest: string[]): Object
  }

  declare export function getFormError(
    getFormState: ?GetFormState,
  ): GetFormErrorInterface<*>

  declare export function getFormNames(
    getFormState: ?GetFormState,
  ): GetFormNamesInterface<*>

  declare export function getFormValues(
    form: string,
    getFormState: ?GetFormState,
  ): (state: any) => any

  declare export function getFormInitialValues(
    form: string,
    getFormState: ?GetFormState,
  ): (state: any) => Object

  declare export function getFormSyncErrors(
    form: string,
    getFormState: ?GetFormState,
  ): (state: any) => Object

  declare export function getFormMeta(
    form: string,
    getFormState: ?GetFormState,
  ): (state: any) => Object

  declare export function getFormAsyncErrors(
    form: string,
    getFormState: ?GetFormState,
  ): (state: any) => Object

  declare export function getFormSyncWarnings(
    form: string,
    getFormState: ?GetFormState,
  ): (state: any) => Object

  declare export function getFormSubmitErrors(
    form: string,
    getFormState: ?GetFormState,
  ): (state: any) => Object

  declare export function hasSubmitSucceeded(
    form: string,
    getFormState: ?GetFormState,
  ): (state: any) => boolean

  declare export function hasSubmitFailed(
    form: string,
    getFormState: ?GetFormState,
  ): (state: any) => boolean

  declare export function isDirty(
    form: string,
    getFormState: ?GetFormState,
  ): (state: any) => boolean

  declare export function isInvalid(
    form: string,
    getFormState: ?GetFormState,
  ): (state: any) => boolean

  declare export function isPristine(
    form: string,
    getFormState: ?GetFormState,
  ): (state: any) => boolean

  declare export function isValid(
    form: string,
    getFormState: ?GetFormState,
  ): (state: any) => boolean

  declare export function isSubmitting(
    form: string,
    getFormState: ?GetFormState,
  ): (state: any) => boolean

  declare export function reduxForm(
    config: ReduxFormConfig,
  ): { (WrappedComponent: React.ComponentType<*>): React.ComponentType<*> }

  declare export class SubmissionError {
    constructor(errors: Object): void;
  }

  declare export function values(
    config: {
      form: string,
      getFormState?: GetFormState,
      prop?: string
    },
  ): { (React.ComponentType<*>): React.ComponentType<*> }

// Action creators
  declare export var arrayInsert: ArrayInsert;
  declare export var arrayMove: ArrayMove;
  declare export var arrayPop: ArrayPop;
  declare export var arrayPush: ArrayPush;
  declare export var arrayRemove: ArrayRemove;
  declare export var arrayRemoveAll: ArrayRemoveAll;
  declare export var arrayShift: ArrayShift;
  declare export var arraySplice: ArraySplice;
  declare export var arraySwap: ArraySwap;
  declare export var arrayUnshift: ArrayUnshift;
  declare export var autofill: Autofill;
  declare export var blur: Blur;
  declare export var change: Change;
  declare export var clearSubmitErrors: ClearSubmitErrors;
  declare export var destroy: Destroy;
  declare export var focus: Focus;
  declare export var initialize: Initialize;
  declare export var registerField: RegisterField;
  declare export var reset: Reset;
  declare export var setSubmitFailed: SetSubmitFailed;
  declare export var setSubmitSucceeded: SetSubmitSucceeded;
  declare export var startAsyncValidation: StartAsyncValidation;
  declare export var startSubmit: StartSubmit;
  declare export var stopAsyncValidation: StopAsyncValidation;
  declare export var stopSubmit: StopSubmit;
  declare export var submit: Submit;
  declare export var touch: Touch;
  declare export var unregisterField: UnregisterField;
  declare export var untouch: Untouch;
}
