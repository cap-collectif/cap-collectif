import * as React from 'react'
import withPageAuthRequired from '@utils/withPageAuthRequired'
import {
  Box,
  Text,
  Flex,
  Heading,
  Icon,
  CapUIIcon,
  CapUIIconSize,
  Button,
  FormLabel,
  InputGroup,
} from '@cap-collectif/ui'
import { useIntl, FormattedHTMLMessage } from 'react-intl'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { RedirectionIOQuery } from '@relay/RedirectionIOQuery.graphql'
import { useForm } from 'react-hook-form'
import { FieldInput, FormControl } from '@cap-collectif/form'
import UpdateRedirectIOProjectKeyMutation from 'mutations/UpdateRedirectIOProjectKeyMutation'

type FormValues = {
  projectKey: string | null
}

export const QUERY = graphql`
  query RedirectionIOQuery($keyname: String!) {
    projectKey: siteParameter(keyname: $keyname) {
      value
      id
    }
  }
`

const formName = 'shorten-url-form'

const RedirectionIO: React.FC = () => {
  const intl = useIntl()
  const query = useLazyLoadQuery<RedirectionIOQuery>(QUERY, {
    keyname: 'redirectionio.project.id',
  })

  if (!query?.projectKey) return null

  const initialValues: FormValues = {
    projectKey: query?.projectKey?.value,
  }

  const { handleSubmit, formState, control, watch } = useForm<FormValues>({
    mode: 'onChange',
    defaultValues: initialValues,
  })

  const { isSubmitting } = formState
  const projectKeyField = watch('projectKey')

  const onSubmit = (values: FormValues) => {
    const input = {
      projectId: values.projectKey,
    }
    return UpdateRedirectIOProjectKeyMutation.commit({ input })
  }

  return (
    <Box bg="white" p={6} borderRadius="8px" mb={8}>
      <Flex align="center" mb={4}>
        <Heading as="h4" color="blue.800" fontWeight={600}>
          {intl.formatMessage({ id: 'url.shortener' })}
        </Heading>
        <Flex align="center">
          <Icon name={CapUIIcon.Info} size={CapUIIconSize.Md} color="blue.500" />
          <Button
            as="a"
            variant="link"
            href="https://aide.cap-collectif.com/article/168-configurer-des-urls-personnalisees"
            target="_blank"
          >
            {intl.formatMessage({ id: 'global.help' })}
          </Button>
        </Flex>
      </Flex>
      <Text>
        {intl.formatMessage(
          { id: 'allow.you.to.shorten.url' },
          {
            link: (
              <Button as="a" variant="link" target="_blank" href="https://redirection.io/pricing">
                Redirection.io
              </Button>
            ),
          },
        )}
      </Text>

      <Flex mb={4} mt={4}>
        <Flex direction="column" mr={4}>
          <Flex mb={1}>
            <Icon color="red.500" name={CapUIIcon.Cross} size={CapUIIconSize.Md} />
            <Text fontWeight={600}>{intl.formatMessage({ id: 'global.before' })}</Text>
          </Flex>
          <Text p={2} color="gray.900" bg="gray.100" borderRadius="10px">
            {intl.formatMessage({ id: 'redirection.io.url.before.example' })}
          </Text>
        </Flex>
        <Icon mt={8} name={CapUIIcon.LongArrowRight} size={CapUIIconSize.Lg} color="gray.500" />
        <Flex direction="column" ml={4}>
          <Flex mb={1}>
            <Icon color="green.500" name={CapUIIcon.Check} size={CapUIIconSize.Md} />
            <Text fontWeight={600}>{intl.formatMessage({ id: 'global.after' })}</Text>
          </Flex>
          <Text p={2} color="gray.900" bg="gray.100" borderRadius="10px">
            {intl.formatMessage({ id: 'redirection.io.url.after.example' })}
          </Text>
        </Flex>
      </Flex>

      <Text fontWeight={600}>{intl.formatMessage({ id: 'global.process' })}</Text>
      <Box>
        <Flex>
          <Text mr={1}>1 -</Text>
          <Text>
            {intl.formatMessage(
              { id: 'activate-redirection-service-step1' },
              {
                link: (
                  <Button as="a" variant="link" target="_blank" href="https://redirection.io/pricing">
                    Redirection.io
                  </Button>
                ),
              },
            )}
          </Text>
        </Flex>
        <Flex>
          <Text mr={1}>2 -</Text>
          <Text>
            {intl.formatMessage(
              { id: 'activate-redirection-service-step2' },
              {
                link: (
                  <Button
                    as="a"
                    variant="link"
                    target="_blank"
                    href="https://redirection.io/documentation/user-documentation/what-are-organizations-and-projects"
                  >
                    {intl.formatMessage({
                      id: 'activate-redirection-service-step2-link',
                    })}
                  </Button>
                ),
              },
            )}
          </Text>
        </Flex>
        <Flex align="flex-start">
          <Text>3 -</Text>
          <Flex direction="column" ml={1}>
            <FormattedHTMLMessage id="activate-redirection-service-step3" />
          </Flex>
        </Flex>
        <Box as="form" id={formName} onSubmit={handleSubmit(onSubmit)} my={6}>
          <FormControl name="projectKey" control={control} isRequired>
            <FormLabel htmlFor="projectKey" label={intl.formatMessage({ id: 'project-key' })} />
            <InputGroup>
              <FieldInput
                width="395px"
                id="projectKey"
                name="projectKey"
                control={control}
                type="text"
                disabled={isSubmitting}
                placeholder={intl.formatMessage({ id: 'your.redirection.io.key' })}
              />
              <Button type="submit" disabled={!projectKeyField} isLoading={isSubmitting}>
                {intl.formatMessage({ id: 'global.use' })}
              </Button>
            </InputGroup>
          </FormControl>
        </Box>
        <Text>4 - {intl.formatMessage({ id: 'create.url.redirection' })}</Text>
        <Text ml={5}>
          {intl.formatMessage(
            { id: 'url-configuration-help-text' },
            {
              link: (
                <Button as="a" variant="link" target="_blank" href="https://redirection.io/pricing">
                  Redirection.io
                </Button>
              ),
            },
          )}
        </Text>
      </Box>
    </Box>
  )
}

export const getServerSideProps = withPageAuthRequired

export default RedirectionIO
