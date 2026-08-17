import * as yup from 'yup'

declare module 'yup' {
  interface StringSchema {
    /**
     * Fails when the value is null/undefined/empty, or contains only whitespace.
     * Use instead of `.required()` for text fields where a blank string
     * ("   ") should be treated the same as an empty one.
     */
    notBlank(message: string): StringSchema
  }
}

yup.addMethod<yup.StringSchema>(yup.string, 'notBlank', function notBlank(message: string) {
  return this.test('not-blank', message, value => !!value?.trim())
})
