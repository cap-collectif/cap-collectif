import { FieldInput, FormControl } from '@cap-collectif/form'
import { AbstractCard, CapUIIcon, Flex, FormLabel, Heading, Icon, Link } from '@cap-collectif/ui'
import TextEditor from '@components/BackOffice/Form/TextEditor/TextEditor'
import UpdateOrganizationMutation from '@mutations/UpdateOrganizationMutation'
import { OrganizationConfigFormGeneral_organization$key } from '@relay/OrganizationConfigFormGeneral_organization.graphql'
import { OrganizationConfigFormGeneral_query$key } from '@relay/OrganizationConfigFormGeneral_query.graphql'
import debounce from '@shared/utils/debounce-promise'
import { mutationErrorToast } from '@shared/utils/toasts'
import * as React from 'react'
import { Control } from 'react-hook-form'
import { useIntl } from 'react-intl'
import { graphql, useFragment } from 'react-relay'
import { FormValues } from './OrganizationConfigForm'

export interface OrganizationConfigFormGeneralProps {
  control: Control<FormValues>
  organization: OrganizationConfigFormGeneral_organization$key
  query: OrganizationConfigFormGeneral_query$key
}

const ORGANIZATION_FRAGMENT = graphql`
  fragment OrganizationConfigFormGeneral_organization on Organization {
    id
    url
  }
`

const QUERY_FRAGMENT = graphql`
  fragment OrganizationConfigFormGeneral_query on Query {
    availableLocales(includeDisabled: false) {
      code
      isDefault
      traductionKey
    }
  }
`

const OrganizationConfigFormGeneral: React.FC<OrganizationConfigFormGeneralProps> = ({
  control,
  organization: organizationRef,
  query: queryRef,
}) => {
  const intl = useIntl()
  const organization = useFragment(ORGANIZATION_FRAGMENT, organizationRef)
  const query = useFragment(QUERY_FRAGMENT, queryRef)
  const defaultLocale = query.availableLocales.find(locale => locale.isDefault)

  const onTitleChange = debounce(async (title: string) => {
    try {
      await UpdateOrganizationMutation.commit({
        input: {
          organizationId: organization?.id || '',
          translations: [{ title, locale: defaultLocale?.code ?? 'FR_FR' }],
        },
      })
    } catch (error) {
      return mutationErrorToast(intl)
    }
  }, 400)

  return (
    <Flex
      as={AbstractCard}
      direction="column"
      spacing={8}
      style={{
        borderRadius: '8px',
        border: 'none',
      }}
      backgroundColor="white"
    >
      <Flex justifyContent="space-between">
        <Heading as="h4" fontWeight="semibold" color="blue.800">
          {intl.formatMessage({ id: 'global.general' })}
        </Heading>
        <Flex color="blue.500">
          <Icon name={CapUIIcon.Eye} />
          <Link
            href={organization?.url ?? ''}
            target="_blank"
            ml={1}
            fontWeight={600}
            sx={{
              textDecoration: 'none !important',
            }}
          >
            {intl.formatMessage({ id: 'global.preview' })}
          </Link>
        </Flex>
      </Flex>
      <Flex direction="column" spacing={6} mt={6}>
        <FormControl name="title" control={control} isRequired mb={0}>
          <FormLabel htmlFor="title" label={intl.formatMessage({ id: 'organisation.form.name' })} />
          <FieldInput
            onChange={event => {
              onTitleChange((event.target as HTMLInputElement).value)
            }}
            id="title"
            name="title"
            control={control}
            type="text"
            maxLength={140}
            placeholder={intl.formatMessage({
              id: 'admiun.project.create.title.placeholder',
            })}
          />
        </FormControl>
        <TextEditor
          name="body"
          placeholder={intl.formatMessage({
            id: 'city-neighbourhood-placeholder',
          })}
          label={intl.formatMessage({ id: 'organisation.description' })}
          platformLanguage={defaultLocale?.code}
          selectedLanguage={defaultLocale?.code || 'fr'}
          limitChars={280}
        />
      </Flex>
    </Flex>
  )
}

export default OrganizationConfigFormGeneral
