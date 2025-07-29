import * as React from 'react'
import { Button, Flex, toast } from '@cap-collectif/ui'
import { FormProvider, useForm } from 'react-hook-form'
import OrganizationConfigFormGeneral from './OrganizationConfigFormGeneral'
import { useIntl } from 'react-intl'
import OrganizationConfigFormSide from './OrganizationConfigFormSide'
import OrganizationConfigFormMembers from './OrganizationConfigFormMembers'
import { getInitialValues } from './OrganizationConfigForm.utils'
import UpdateOrganizationMutation from '@mutations/UpdateOrganizationMutation'
import { UpdateOrganizationInput } from '@relay/UpdateOrganizationMutation.graphql'
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay'
import { OrganizationConfigFormQuery } from '@relay/OrganizationConfigFormQuery.graphql'
import { mutationErrorToast } from '@shared/utils/mutation-error-toast'
import OrganizationConfigFormDeleteOrganizationModal from './OrganizationConfigFormDeleteOrganizationModal'
import { OrganizationConfigForm_organization$key } from '@relay/OrganizationConfigForm_organization.graphql'

export interface OrganizationConfigFormProps {
  organization: OrganizationConfigForm_organization$key
}

export const QUERY = graphql`
  query OrganizationConfigFormQuery {
    availableLocales(includeDisabled: false) {
      code
      isEnabled
      isDefault
      traductionKey
    }
    ...OrganizationConfigFormGeneral_query
  }
`

export type FormValues = {
  title: string
  body: string | null
  socialNetworks: {
    webPageUrl: string | null
    facebookUrl: string | null
    twitterUrl: string | null
  }
  logo?: {
    readonly id: string
    readonly name: string
    readonly size: string
    readonly type: string
    readonly url: string
  } | null
  banner?: {
    readonly id: string
    readonly name: string
    readonly size: string
    readonly type: string
    readonly url: string
  } | null
}

const formName = 'organization_config_form'

const FRAGMENT = graphql`
  fragment OrganizationConfigForm_organization on Organization {
    id
    title
    body
    logo {
      id
      name
      size
      type: contentType
      url(format: "reference")
    }
    banner {
      id
      name
      size
      type: contentType
      url(format: "reference")
    }
    socialNetworks {
      webPageUrl
      facebookUrl
      twitterUrl
    }
    deletedAt
    ...OrganizationConfigFormMembers_organization
    ...OrganizationConfigFormDeleteOrganizationModal_organization
    ...OrganizationConfigFormGeneral_organization
  }
`

const OrganizationConfigForm: React.FC<OrganizationConfigFormProps> = ({ organization: orgRef }) => {
  const intl = useIntl()
  const query = useLazyLoadQuery<OrganizationConfigFormQuery>(QUERY, {})
  const defaultLocale = query.availableLocales.find(locale => locale.isDefault)
  const organization = useFragment(FRAGMENT, orgRef)
  const methods = useForm<FormValues>({
    mode: 'onChange',
    defaultValues: getInitialValues(organization, intl),
  })

  const { handleSubmit, formState, control } = methods

  const onSubmit = (values: FormValues) => {
    const input: UpdateOrganizationInput = {
      organizationId: organization?.id || '',
      banner: values?.banner?.id || '',
      logo: values?.logo?.id || '',
      translations: [{ body: values.body, title: values.title, locale: defaultLocale?.code || 'FR_FR' }],
      webPageUrl: values.socialNetworks.webPageUrl,
      facebookUrl: values.socialNetworks.facebookUrl,
      twitterUrl: values.socialNetworks.twitterUrl,
    }
    UpdateOrganizationMutation.commit({ input })
      .then(() => {
        toast({
          variant: 'success',
          content: intl.formatMessage({ id: 'global.changes.saved' }),
        })
      })
      .catch(() => mutationErrorToast(intl))
  }

  const { isSubmitting } = formState

  return (
    <Flex
      as="form"
      id={formName}
      onSubmit={handleSubmit(onSubmit)}
      direction="column"
      alignItems="flex-start"
      spacing={6}
    >
      <Flex direction="row" width="100%" spacing={6}>
        <Flex direction="column" spacing={6} width="70%">
          <FormProvider {...methods}>
            <OrganizationConfigFormGeneral control={control} organization={organization} query={query} />
          </FormProvider>
          <OrganizationConfigFormMembers organization={organization} />
          <Flex direction="row" spacing={4}>
            <Button type="submit" isLoading={isSubmitting}>
              {intl.formatMessage({ id: 'global.save' })}
            </Button>
            {!organization.deletedAt && <OrganizationConfigFormDeleteOrganizationModal organization={organization} />}
          </Flex>
        </Flex>
        <Flex direction="column" spacing={6} width="30%">
          <OrganizationConfigFormSide control={control} />
        </Flex>
      </Flex>
    </Flex>
  )
}

export default OrganizationConfigForm
/*

 */
