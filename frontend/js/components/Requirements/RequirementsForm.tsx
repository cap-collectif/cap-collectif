import * as React from 'react'
import { FormattedHTMLMessage, FormattedMessage, useIntl } from 'react-intl'
import {
  CapUISpotIcon,
  CapUISpotIconSize,
  Flex,
  FormGuideline,
  FormLabel,
  Heading,
  InputGroup,
  SpotIcon,
  Text,
  Icon,
  CapUIIcon,
  CapInputSize,
} from '@cap-collectif/ui'
import { COUNTRY_CODES, FieldInput, FormControl } from '@cap-collectif/form'
import LoginSocialButton from '~ui/Button/LoginSocialButton'
import FranceConnectIcon from '~ui/Icons/FranceConnectIcon'

type Props = {
  initialValues: Record<string, any>
  isPhoneVerificationOnly: boolean
  control: any
  formState: any
  trigger: any
  setValue: any
}
export const CODE_MINIMAL_LENGTH = 8

const getLabel = (requirementType: string) => {
  if (requirementType === 'FirstnameRequirement') {
    return <FormattedMessage id="form.label_firstname" />
  }

  if (requirementType === 'LastnameRequirement') {
    return <FormattedMessage id="global.name" />
  }

  if (requirementType === 'PhoneRequirement') {
    return <FormattedMessage id="mobile-phone" />
  }

  if (requirementType === 'DateOfBirthRequirement') {
    return <FormattedMessage id="form.label_date_of_birth" />
  }

  if (requirementType === 'PostalAddressRequirement') {
    return <FormattedMessage id="admin.fields.event.address" />
  }

  if (requirementType === 'IdentificationCodeRequirement') {
    return <FormattedMessage id="identification_code" />
  }

  if (requirementType === 'FranceConnectRequirement') {
    return <FormattedMessage id="france_connect" />
  }

  if (requirementType === 'PhoneVerifiedRequirement') {
    return <FormattedMessage id="verify.number.sms" />
  }

  return ''
}

const RequirementsForm = ({ initialValues, isPhoneVerificationOnly, control, formState, trigger, setValue }: Props) => {
  const intl = useIntl()
  React.useEffect(() => {
    trigger() // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const { isSubmitting } = formState

  if (isPhoneVerificationOnly) {
    return (
      <Flex as="form" direction="column" spacing={3} align="center" justify="center">
        <SpotIcon name={CapUISpotIcon.ADD_CONTACT} size={CapUISpotIconSize.Lg} />
        <Text textAlign="center" fontSize="18px" lineHeight="24px">
          <FormattedHTMLMessage id="proposal.requirement.header.title" />
        </Text>
        <InputGroup>
          <FormLabel label="" />
          <FormControl name="PhoneVerifiedRequirement.CountryCode" control={control} isDisabled>
            <FieldInput
              uniqueCountry={COUNTRY_CODES.FR}
              type="flagSelect"
              name="PhoneVerifiedRequirement.CountryCode"
              control={control}
              placeholder={intl.formatMessage({
                id: 'select.country.placeholder',
              })}
            />
          </FormControl>
          <FormControl name="PhoneVerifiedRequirement.phoneNumber" control={control} isDisabled={isSubmitting}>
            <FieldInput type="tel" name="PhoneVerifiedRequirement.phoneNumber" control={control} />
          </FormControl>
        </InputGroup>
      </Flex>
    )
  }

  return (
    <Flex direction="column" spacing={6} as="form">
      <Heading as="h4" fontSize={3}>
        {intl.formatMessage({
          id: 'vote.modal.body.form.title',
        })}
      </Heading>
      <Flex direction="column" width="300px">
        {Object.keys(initialValues).map(key => {
          if (key === 'FranceConnectRequirement') {
            if (!initialValues[key]) {
              return (
                <Flex justify="left" textAlign="left">
                  <LoginSocialButton justifyContent="left" type="franceConnect" noHR fcTitle="fc-requirement-title" />
                  <FormControl
                    style={{
                      display: 'none',
                    }}
                    name="franceConnect_"
                    id="franceConnect_"
                    control={control}
                    isRequired
                  >
                    <FieldInput
                      type="hidden"
                      name="franceConnect_"
                      id="franceConnect_"
                      control={control}
                      defaultValue={false}
                    />
                  </FormControl>
                </Flex>
              )
            }

            if (initialValues[key]) {
              return (
                <Flex mb="16px">
                  <Icon name={CapUIIcon.Check} color="green.500" alignSelf="center" />
                  <FranceConnectIcon />
                  <FormControl
                    style={{
                      display: 'none',
                    }}
                    name="franceConnect_"
                    id="franceConnect_"
                    control={control}
                    isRequired
                  >
                    <FieldInput
                      type="hidden"
                      name="franceConnect_"
                      id="franceConnect_"
                      control={control}
                      defaultValue
                    />
                  </FormControl>
                </Flex>
              )
            }
          }

          if (key === 'IdentificationCodeRequirement') {
            return (
              <FormControl name={key} control={control} isRequired isDisabled={isSubmitting}>
                <FormLabel label={getLabel(key)} />
                <FieldInput
                  variantSize={CapInputSize.Md}
                  type="text"
                  name={key}
                  control={control}
                  defaultValue={initialValues[key]}
                />
              </FormControl>
            )
          }

          if (key === 'PostalAddressRequirement') {
            return (
              <>
                <FormControl name={key} control={control} isRequired isDisabled={isSubmitting}>
                  <FormLabel label={getLabel(key)} />
                  <FieldInput
                    variantSize={CapInputSize.Md}
                    type="address"
                    name={key}
                    control={control}
                    defaultValue={initialValues[key]}
                    getAddress={add => {
                      setValue('realAddress', add)
                    }}
                  />
                </FormControl>
                <FormControl
                  style={{
                    display: 'none',
                  }}
                  name="realAddress"
                  control={control}
                  isRequired
                >
                  <FieldInput
                    type="hidden"
                    name="realAddress"
                    control={control}
                    defaultValue=""
                    placeholder={intl.formatMessage({
                      id: 'global.address',
                    })}
                  />
                </FormControl>
              </>
            )
          }

          if (key === 'CheckboxRequirement') {
            return initialValues[key].map((checkboxRequirement, idx) => (
              <FormControl
                name={`${key}[${idx}].viewerMeetsTheRequirement`}
                control={control}
                isRequired
                isDisabled={isSubmitting}
              >
                <FieldInput
                  variantSize={CapInputSize.Md}
                  type="checkbox"
                  name={`${key}[${idx}].viewerMeetsTheRequirement`}
                  control={control}
                  defaultValue={checkboxRequirement.viewerMeetsTheRequirement}
                >
                  {checkboxRequirement.label}
                </FieldInput>
              </FormControl>
            ))
          }

          if (key === 'PhoneVerifiedRequirement' || key === 'PhoneRequirement') {
            return (
              <InputGroup>
                <FormLabel label={getLabel(key)} />
                {key === 'PhoneVerifiedRequirement' && (
                  <FormGuideline>
                    {intl.formatMessage({
                      id: 'phone.number.guideline',
                    })}
                  </FormGuideline>
                )}
                <FormControl name={`${key}.CountryCode`} control={control} isDisabled isRequired flex="50%">
                  <FieldInput
                    uniqueCountry={COUNTRY_CODES.FR}
                    type="flagSelect"
                    name={`${key}.CountryCode`}
                    control={control}
                    placeholder={intl.formatMessage({
                      id: 'select.country.placeholder',
                    })}
                    isDisabled
                  />
                </FormControl>
                <FormControl
                  name={`${key}.phoneNumber`}
                  control={control}
                  isRequired
                  flex="50%"
                  isDisabled={isSubmitting}
                >
                  <FieldInput type="tel" name={`${key}.phoneNumber`} control={control} />
                </FormControl>
              </InputGroup>
            )
          }

          if (key === 'DateOfBirthRequirement') {
            return (
              <FormControl name="DateOfBirthRequirement" control={control} isRequired>
                <FormLabel label={getLabel(key)} />
                <FieldInput type="date" name="DateOfBirthRequirement" control={control} isOutsideRange />
              </FormControl>
            )
          }

          return (
            <FormControl name={key} control={control} isRequired isDisabled={isSubmitting}>
              <FormLabel label={getLabel(key)} />
              <FieldInput
                variantSize={CapInputSize.Md}
                type="text"
                minLength={4}
                name={key}
                control={control}
                defaultValue={initialValues[key]}
              />
            </FormControl>
          )
        })}
      </Flex>
    </Flex>
  )
}

export default RequirementsForm
