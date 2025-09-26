import * as React from 'react'
import { graphql, useFragment } from 'react-relay'
import { useIntl } from 'react-intl'
import { openPrivacyModal } from './PrivacyModal'
import type { RegistrationForm_query$key } from '@relay/RegistrationForm_query.graphql'
import { openChartModal } from './ChartModal'
import { Box, CapInputSize, CapUIFontSize, FormLabel, Text } from '@cap-collectif/ui'
import { useFeatureFlags } from '@shared/hooks/useFeatureFlag'
import { useFormContext } from 'react-hook-form'
import Captcha from '@shared/form/Captcha'
import Password from '@shared/form/Password'
import { FieldInput, FormControl } from '@cap-collectif/form'
import Responses from '@shared/form/Responses'

const REGEX_USERNAME = RegExp("^[a-zA-Z0-9_\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u024F-·' ]+$")

type Props = {
  query: RegistrationForm_query$key
}

export const form = 'registration-form'

export const ChartLinkComponent = ({ cguName }: { cguName?: string }) => {
  const intl = useIntl()

  return (
    <Box
      as="span"
      css={{
        '& > span': {
          display: 'inline-flex',
          alignItems: 'center',
        },
      }}
    >
      {intl.formatMessage(
        { id: 'registration.charte' },
        {
          link: (
            <Box
              as="button"
              type="button"
              fontSize={CapUIFontSize.BodyRegular}
              mx={1}
              onClick={() => {
                dispatchEvent(new Event(openChartModal))
              }}
            >
              {cguName ?? intl.formatMessage({ id: 'the-charter' })}
            </Box>
          ),
        },
      )}
    </Box>
  )
}
export const PrivacyPolicyComponent = ({
  privacyPolicyRequired,
  privacyOnly,
  helpText,
}: {
  privacyPolicyRequired?: boolean
  privacyOnly?: boolean
  helpText?: string
}) => {
  const intl = useIntl()
  if (!privacyPolicyRequired) return null
  return (
    <Box as="span" display="inline-flex" alignItems="center">
      {!privacyOnly ? <>{intl.formatMessage({ id: 'and-the' })}&nbsp;</> : helpText ? <>{helpText}&nbsp;</> : null}
      <Box
        as="button"
        type="button"
        id="privacy-policy"
        onClick={() => dispatchEvent(new Event(openPrivacyModal))}
        name="privacy"
        fontSize={CapUIFontSize.BodyRegular}
      >
        {intl.formatMessage({ id: 'capco.module.privacy_policy' })}
      </Box>
    </Box>
  )
}

const FRAGMENT = graphql`
  fragment RegistrationForm_query on Query {
    organizationName: siteParameter(keyname: "global.site.organization_name") {
      value
    }
    internalCommunicationFrom: siteParameter(keyname: "global.site.communication_from") {
      value
    }
    registrationForm {
      ...Responses_questions
    }
    userTypes {
      edges {
        node {
          value: id
          label: name
        }
      }
    }
    chart: siteParameter(keyname: "charter.body") {
      value
    }
    privacy: siteParameter(keyname: "privacy-policy") {
      value
    }
  }
`

export const RegistrationForm: React.FC<Props> = ({ query: queryFragment }) => {
  const query = useFragment(FRAGMENT, queryFragment)
  const intl = useIntl()
  const {
    captcha: addCaptchaField,
    user_type: addUserTypeField,
    zipcode_at_register: addZipcodeField,
    consent_external_communication: addConsentExternalCommunicationField,
    consent_internal_communication: addConsentInternalCommunicationField,
    privacy_policy: privacyPolicyRequired,
  } = useFeatureFlags([
    'captcha',
    'user_type',
    'zipcode_at_register',
    'consent_external_communication',
    'consent_internal_communication',
    'privacy_policy',
  ])

  const userTypesData = query.userTypes.edges.map(userType => userType.node)

  const userTypes = [{ label: intl.formatMessage({ id: 'registration.select.type' }), value: '' }, ...userTypesData]

  const {
    control,
    watch,
    formState: { errors },
  } = useFormContext()

  const disableEmail = !!watch('invitationToken')

  const hasChart = !!query.chart?.value
  const hasPrivacy = !!query?.privacy?.value

  return (
    <>
      {errors._error ? (
        <Box
          id="register-error"
          p={4}
          borderRadius="normal"
          border="normal"
          backgroundColor="red.100"
          borderColor="red.400"
          color="red.600"
          mb={5}
          fontWeight={600}
        >
          {intl.formatMessage({ id: errors._error?.message as string })}
        </Box>
      ) : null}
      <FormControl name="email" control={control} isRequired mb={2}>
        <FormLabel htmlFor="email" label={intl.formatMessage({ id: 'global.email' })} mb={0} />
        <FieldInput
          type="email"
          control={control}
          disabled={disableEmail}
          name="email"
          autoFocus
          aria-required
          autoComplete="email"
          variantSize={CapInputSize.Md}
          placeholder={intl.formatMessage({
            id: 'email.placeholder',
          })}
        />
      </FormControl>
      <Password id="password" name="plainPassword" />
      <FormControl name="username" control={control} isRequired mb={2}>
        <FormLabel htmlFor="username" label={intl.formatMessage({ id: 'global.fullname' })} mb={0} />
        <FieldInput
          type="text"
          control={control}
          name="username"
          id="username"
          minLength={2}
          rules={{
            pattern: {
              value: REGEX_USERNAME,
              message: intl.formatMessage({ id: 'registration.constraints.username.symbol' }),
            },
          }}
          aria-required
          autoComplete="username"
          variantSize={CapInputSize.Md}
          placeholder={intl.formatMessage({
            id: 'global.placeholder.name',
          })}
        />
      </FormControl>
      {addUserTypeField ? (
        <FormControl name="userType" control={control} mb={2}>
          <FormLabel htmlFor="userType" label={intl.formatMessage({ id: 'registration.type' })} mb={0}>
            <Text fontSize={CapUIFontSize.BodySmall} color="gray.500" fontWeight="normal">
              {intl.formatMessage({ id: 'global.optional' })}
            </Text>
          </FormLabel>
          <FieldInput
            type="select"
            control={control}
            name="userType"
            options={userTypes}
            // @ts-ignore fix DS typing
            variantSize={CapInputSize.Md}
            // @ts-ignore fix DS typing
            inputId="userType"
            placeholder={intl.formatMessage({
              id: 'registration.type',
            })}
          />
        </FormControl>
      ) : null}
      {addZipcodeField ? (
        <FormControl name="zipcode" control={control} mb={2}>
          <FormLabel htmlFor="zipcode" label={intl.formatMessage({ id: 'user.register.zipcode' })} mb={0}>
            <Text fontSize={CapUIFontSize.BodySmall} color="gray.500" fontWeight="normal">
              {intl.formatMessage({ id: 'global.optional' })}
            </Text>
          </FormLabel>
          <FieldInput
            type="text"
            control={control}
            name="zipcode"
            autoComplete="postal-code"
            variantSize={CapInputSize.Md}
          />
        </FormControl>
      ) : null}
      <Responses questions={query.registrationForm} />
      {hasChart || hasPrivacy ? (
        <FormControl name="charte" control={control} isRequired mb={2}>
          <FieldInput
            id="charte"
            type="checkbox"
            control={control}
            name="charte"
            variantSize={CapInputSize.Md}
            rules={{ required: intl.formatMessage({ id: 'registration.constraints.charte.check' }) }}
          >
            <Box
              color="neutral-gray.900"
              as="span"
              sx={{ button: { textDecoration: 'underline', ml: 0 }, fontWeight: 400 }}
            >
              {hasChart ? <ChartLinkComponent /> : null}
              {hasPrivacy ? (
                <PrivacyPolicyComponent
                  privacyPolicyRequired={privacyPolicyRequired}
                  privacyOnly={!hasChart}
                  helpText={intl.formatMessage({ id: 'global.accept' })}
                />
              ) : null}
            </Box>
          </FieldInput>
        </FormControl>
      ) : null}
      {addConsentInternalCommunicationField ? (
        <FormControl name="consentInternalCommunication" control={control} mb={2} sx={{ label: { fontWeight: 400 } }}>
          <FieldInput
            id="consent-internal-communication"
            type="checkbox"
            control={control}
            name="consentInternalCommunication"
            variantSize={CapInputSize.Md}
          >
            {intl.formatMessage(
              { id: 'receive-news-and-results-of-the-consultations' },
              { from: query?.internalCommunicationFrom?.value },
            )}
          </FieldInput>
        </FormControl>
      ) : null}
      {addConsentExternalCommunicationField ? (
        <FormControl name="consentExternalCommunication" control={control} mb={2} sx={{ label: { fontWeight: 400 } }}>
          <FieldInput
            id="consent-external-communication"
            type="checkbox"
            control={control}
            name="consentExternalCommunication"
            variantSize={CapInputSize.Md}
          >
            {intl.formatMessage(
              { id: 'registration.consent_external_communication' },
              { organization_name: query?.organizationName?.value },
            )}
          </FieldInput>
        </FormControl>
      ) : null}
      {addCaptchaField && <Captcha name="captcha" required />}
    </>
  )
}

export default RegistrationForm
