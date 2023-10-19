// @ts-nocheck
import * as yup from 'yup'
import type { IntlShape } from 'react-intl'
import { CODE_MINIMAL_LENGTH } from '~/components/Requirements/RequirementsForm'

const generateValidationSchema = (initialValues: any, isAuthenticated: boolean, intl: IntlShape) => {
  return yup.object().shape({
    ...('IdentificationCodeRequirement' in initialValues && {
      IdentificationCodeRequirement: yup
        .string()
        .min(
          CODE_MINIMAL_LENGTH,
          intl.formatMessage({
            id: 'BAD_CODE',
          }),
        )
        .required(
          intl.formatMessage({
            id: 'global.required',
          }),
        ),
    }),
    ...('FranceConnectRequirement' in initialValues && {
      franceConnect_: yup.boolean().oneOf(
        [true],
        intl.formatMessage({
          id: 'global.required',
        }),
      ),
    }),
    ...('CheckboxRequirement' in initialValues && {
      CheckboxRequirement: yup.array().of(
        yup.object({
          viewerMeetsTheRequirement: yup.boolean().oneOf(
            [true],
            intl.formatMessage({
              id: 'global.required',
            }),
          ),
        }),
      ),
    }),
    ...('PhoneVerifiedRequirement' in initialValues && {
      PhoneVerifiedRequirement: yup.object({
        CountryCode: yup.string().required(
          intl.formatMessage({
            id: 'global.required',
          }),
        ),
        phoneNumber: yup
          .string()
          .ensure()
          .min(
            10,
            intl.formatMessage({
              id: 'profile.constraints.phone.invalid',
            }),
          )
          .max(
            12,
            intl.formatMessage({
              id: 'profile.constraints.phone.invalid',
            }),
          )
          .matches(
            '^0(6|7)',
            intl.formatMessage({
              id: 'phone.validation.start.with.mobile',
            }),
          ) // TODO fix match regex to check if string has whitespace
          .matches(
            '\\d+$',
            intl.formatMessage({
              id: 'invalid-format',
            }),
          ),
      }),
    }),
    ...('PhoneRequirement' in initialValues && {
      PhoneRequirement: yup.object({
        CountryCode: yup.string().required(
          intl.formatMessage({
            id: 'global.required',
          }),
        ),
        phoneNumber: yup
          .string()
          .ensure()
          .min(
            10,
            intl.formatMessage({
              id: 'profile.constraints.phone.invalid',
            }),
          )
          .max(
            12,
            intl.formatMessage({
              id: 'profile.constraints.phone.invalid',
            }),
          )
          .matches(
            '^0(6|7)',
            intl.formatMessage({
              id: 'phone.validation.start.with.mobile',
            }),
          ) // TODO fix match regex to check if string has whitespace
          .matches(
            '\\d+$',
            intl.formatMessage({
              id: 'invalid-format',
            }),
          ),
      }),
    }),
    ...('LastnameRequirement' in initialValues && {
      LastnameRequirement: yup
        .string()
        .ensure()
        .required(
          intl.formatMessage({
            id: 'global.required',
          }),
        ),
    }),
    ...('FirstnameRequirement' in initialValues && {
      FirstnameRequirement: yup
        .string()
        .ensure()
        .required(
          intl.formatMessage({
            id: 'global.required',
          }),
        ),
    }),
    ...('DateOfBirthRequirement' in initialValues && {
      DateOfBirthRequirement: yup.date().required(
        intl.formatMessage({
          id: 'global.required',
        }),
      ),
    }),
    ...('PostalAddressRequirement' in initialValues && {
      PostalAddressRequirement: yup
        .string()
        .ensure()
        .required(
          intl.formatMessage({
            id: 'global.required',
          }),
        ),
      realAddress: yup.mixed().test('realAddressTest', '', function (this: yup.TestContext, fieldValue: any): boolean {
        if (!!this.parent.PostalAddressRequirement && !fieldValue) {
          return this.createError({
            message: intl.formatMessage({
              id: 'proposal.constraints.address',
            }),
            path: 'PostalAddressRequirement',
          })
        }

        return true
      }),
    }),
  })
}

export default generateValidationSchema
