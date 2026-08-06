import { FieldInput, FormControl } from '@cap-collectif/form'
import { Box, Button, FormLabel, Heading, Text } from '@cap-collectif/ui'
import Layout from '@components/BackOffice/Layout/Layout'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import useShowPassword from '@shared/hooks/useShowPassword'
import { hubApiGreenQuery } from '@relay/hubApiGreenQuery.graphql'
import UpdateHubApiGreenConfigurationMutation from '@mutations/UpdateHubApiGreenConfigurationMutation'
import withPageAuthRequired from '@utils/withPageAuthRequired'
import React, { Suspense, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { useRouter } from 'next/router'
import { useAppContext } from '@components/BackOffice/AppProvider/App.context'
import { mutationErrorToast, successToast } from '@shared/utils/toasts'

type FormValues = {
  token: string
}

export const QUERY = graphql`
  query hubApiGreenQuery {
    hubApiGreenConfiguration {
      isConfigured
    }
  }
`

const HubApiGreenConfigurationContent: React.FC = () => {
  const intl = useIntl()
  const query = useLazyLoadQuery<hubApiGreenQuery>(QUERY, {})
  const [isConfigured, setIsConfigured] = useState(query.hubApiGreenConfiguration.isConfigured)
  const { showPassword, onClickActions } = useShowPassword()
  const { control, handleSubmit, formState, reset } = useForm<FormValues>({
    mode: 'onChange',
    defaultValues: { token: '' },
  })

  const onSubmit = async ({ token }: FormValues) => {
    try {
      await UpdateHubApiGreenConfigurationMutation.commit({ input: { token } })
      reset({ token: '' })
      setIsConfigured(true)
      successToast(intl.formatMessage({ id: 'global.saved' }))
    } catch (error) {
      mutationErrorToast(intl)
    }
  }

  return (
    <Box bg="white" p={6} borderRadius="8px" as="form" onSubmit={handleSubmit(onSubmit)}>
      <Heading as="h2" color="blue.800" fontWeight={600} mb={3}>
        {intl.formatMessage({ id: 'admin.hub-api-green' })}
      </Heading>
      <Text mb={6}>{intl.formatMessage({ id: 'admin.hub-api-green.description' })}</Text>
      <Text mb={4}>
        {isConfigured
          ? intl.formatMessage({ id: 'admin.hub-api-green.configured' })
          : intl.formatMessage({ id: 'admin.hub-api-green.not-configured' })}
      </Text>
      <FormControl name="token" control={control} isRequired mb={6}>
        <FormLabel htmlFor="hub-api-green-token" label={intl.formatMessage({ id: 'admin.hub-api-green.token' })} />
        <FieldInput
          id="hub-api-green-token"
          name="token"
          control={control}
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          onClickActions={onClickActions}
        />
      </FormControl>
      <Button type="submit" variant="primary" variantSize="big" isLoading={formState.isSubmitting}>
        {intl.formatMessage({ id: 'global.save' })}
      </Button>
    </Box>
  )
}

const HubApiGreenConfigurationPage: React.FC = () => {
  const intl = useIntl()
  const router = useRouter()
  const { viewerSession } = useAppContext()
  const isHubApiGreenEnabled = useFeatureFlag('hub_api_green')
  const canView = viewerSession.isSuperAdmin && isHubApiGreenEnabled

  useEffect(() => {
    if (!canView) {
      void router.replace('/admin-next')
    }
  }, [canView, router])

  if (!canView) return null

  return (
    <Layout navTitle={intl.formatMessage({ id: 'admin.hub-api-green' })}>
      <Suspense fallback={null}>
        <HubApiGreenConfigurationContent />
      </Suspense>
    </Layout>
  )
}

export const getServerSideProps = withPageAuthRequired

export default HubApiGreenConfigurationPage
