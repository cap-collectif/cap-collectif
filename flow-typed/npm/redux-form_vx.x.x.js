type ReduxFormFormProps = {|
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

// FlowTypes exported by redux-form are not exact right now, so I added this one
// to be able to use exact types.
type ReduxFormFieldArrayProps = {|
  fields: ReduxFormFields,
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
|};

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

  declare export type InputProps = {
    name: string,
    value: string | boolean,
    valid: boolean,
    invalid: boolean,
    dirty: boolean,
    pristine: boolean,
    active: boolean,
    touched: boolean,
    visited: boolean,
    autofilled: boolean,
    error?: string,
    onChange: (eventOrValue: SyntheticEvent<any> | string | boolean) => mixed,
    onUpdate: (eventOrValue: SyntheticEvent<any>  | string | boolean) => mixed,
    onBlur: (eventOrValue: SyntheticEvent<any>  | string | boolean) => mixed,
    onDragStart: Function,
    onDrop: Function,
    onFocus: Function,
  };

  declare export type MetaProps = {
    active: boolean,
    autofilled: boolean,
    asyncValidating: boolean,
    dirty: boolean,
    dispatch: Function,
    error?: string,
    invalid: boolean,
    pristine: boolean,
    submitting: boolean,
    touched: boolean,
    valid: boolean,
    visited: boolean,
  };

  declare export type FieldInputProps = {
    input: InputProps,
    meta: MetaProps,
  };

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

  declare export type RegisteredField<T> = {
    name: $Keys<T>,
    type: string,
  };

  declare export type FormState<T> = {
    values: T,
    initial: T,
    registeredFields: Array<RegisteredField<T>>,
  };

  declare export type FormProps = {
    active: string,
    asyncValidate: (values: Object, dispatch: Function, props: Object) => Promise<void>,
    asyncValidating: string | boolean,
    destroyForm: Function,
    dirty: boolean,
    error: string,
    fields: { [fieldName: string]: InputProps },
    handleSubmit: (data: { [field: string]: string }) => void | Promise<any>,
    initializeForm: (data:Object) => any,
    invalid: boolean,
    pristine: boolean,
    resetForm: Function,
    formKey: string,
    submitting: boolean,
    submitFailed: boolean,
    touch: (...fields: Array<string>) => void,
    touchAll: () => void,
    untouch: (...fields: Array<string>) => void,
    untouchAll: () => void,
    valid: boolean,
    values: Object
  };

  declare export type FormConfig = {
    fields: Array<string>,
    form: string,
    alwaysAsyncValidate?: boolean,
    asyncBlurFields?: Array<string>,
    asyncValidate?: (values: Object, dispatch: Function, props: Object) => Promise<void>,
    destroyOnUnmount?: boolean,
    formKey?: string,
    getFormState?: (state: Object, reduxMountPoint: string) => mixed,
    initialValues?: { [field: string]: string },
    onSubmit?: Function,
    onSubmitFail?: Function,
    onSubmitSuccess?: Function,
    overwriteOnInitialValuesChange?: boolean,
    propNamespace?: string,
    readonly?: boolean,
    reduxMountPoint?: String,
    returnRejectedSubmitPromise?: boolean,
    touchOnBlur?: boolean,
    touchOnChange?: boolean,
    validate?: (values:Object, props:Object) => Object
  };

  declare export type FormComponentProps = {
    // State:
    asyncValidating: boolean,   // true if async validation is running
    dirty: boolean,             // true if any values are different from initialValues
    error: any,                 // form-wide error from '_error' key in validation result
    warning: any,               // form-wide warning from '_warning' key in validation result
    invalid: boolean,           // true if there are any validation errors
    initialized: boolean,       // true if the form has been initialized
    pristine: boolean,          // true if the values are the same as initialValues
    submitting: boolean,        // true if the form is in the process of being submitted
    submitFailed: boolean,      // true if the form was submitted and failed for any reason
    submitSucceeded: boolean,   // true if the form was successfully submitted
    valid: boolean,             // true if there are no validation errors
    // Actions:
    array: {
      insert: Function,          // function to insert a value into an array field
      move: Function,            // function to move a value within an array field
      pop: Function,             // function to pop a value off of an array field
      push: Function,            // function to push a value onto an array field
      remove: Function,          // function to remove a value from an array field
      removeAll: Function,       // function to remove all the values from an array field
      shift: Function,           // function to shift a value out of an array field
      splice: Function,          // function to splice a value into an array field
      swap: Function,            // function to swap values in an array field
    },
    asyncValidate: Function,     // function to trigger async validation
    blur: Function,              // action to mark a field as blurred
    change: Function,            // action to change the value of a field
    destroy: Function,           // action to destroy the form's data in Redux
    dispatch: Function,          // the Redux dispatch action
    handleSubmit: Function,      // function to submit the form
    initialize: Function,        // action to initialize form data
    reset: Function,             // action to reset the form data to previously initialized values
    touch: Function,             // action to mark fields as touched
    untouch: Function,           // action to mark fields as untouched
  };

  declare function getValues(state: any): any;
  declare export class Field<P> extends React.Component<FieldProps<P>, void> {}
  declare export function reducer(state: any, action: Object): any;
  declare export function reduxForm<P>(config: FormConfig):
    (component: React.ComponentType<P>) => React.StatelessFunctionalComponent<$Diff<P, FormComponentProps>, void>

    
    declare export var FormSection: ComponentType<{ name: string, className: string }>;
  
  
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
  
  
    declare export var FieldArray: ComponentType<{
      name: string,
      component: React.ComponentType<*> | Function,
      props?: Object,
      rerenderOnEveryChange?: boolean,
      validate?: (value: any, allValues: Object, props: Object) => ?any,
      warn?: (value: any, allValues: Object, props: Object) => ?any,
      withRef?: boolean
    }>;
  
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
    ): { (WrappedComponent: ComponentType<*>): ComponentType<*> }
  
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
