import { FC } from 'react'
import { useIntl } from 'react-intl'
import {
  Box,
  Text,
  Flex,
  Heading,
  FormLabel,
  InputGroup,
  Button,
  FormGuideline,
  Tag,
  CapUILineHeight,
  Tooltip,
  toast,
} from '@cap-collectif/ui'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { DomainQuery } from '@relay/DomainQuery.graphql'
import { FieldInput, FormControl } from '@cap-collectif/form'
import { useForm } from 'react-hook-form'
import UpdateCustomDomainMutation from 'mutations/UpdateCustomDomainMutation'
import DeleteCustomDomainModal from './DeleteCustomDomainModal'
import { useDisclosure } from '@liinkiing/react-hooks'
import { mutationErrorToast } from '../../utils/mutation-error-toast'

type FormValues = {
  subDomain: string
  customDomain: string | undefined
}

export const QUERY = graphql`
  query DomainQuery {
    siteSettings {
      capcoDomain
      customDomain
      status
      ...DeleteCustomDomainModal_siteSettings
    }
  }
`

const formName = 'custom-domain-form'

const Domain: FC = () => {
  const intl = useIntl()

  const query = useLazyLoadQuery<DomainQuery>(QUERY, {})
  const { isOpen, onOpen, onClose } = useDisclosure(false)

  if (!query?.siteSettings?.capcoDomain) return null

  const { capcoDomain, customDomain, status } = query.siteSettings

  const initialValues: FormValues = {
    subDomain: capcoDomain,
    customDomain: undefined,
  }

  const { handleSubmit, formState, control, setError, setValue, watch } = useForm<FormValues>({
    mode: 'onChange',
    defaultValues: initialValues,
  })

  const { isSubmitting } = formState

  const isRootDomain = (): boolean => {
    if (!customDomainFieldValue) return false
    const parts = customDomainFieldValue.split('.')
    if (parts.length !== 2) return false
    return !!parts[1]
  }

  const onSubmit = (values: FormValues) => {
    const { customDomain } = values
    const input = {
      customDomain,
    }
    return UpdateCustomDomainMutation.commit({ input }).then(response => {
      const errorCode = response.updateCustomDomain?.errorCode
      const siteSettings = response.updateCustomDomain?.siteSettings
      if (errorCode === 'CUSTOM_DOMAIN_SYNTAX_NOT_VALID') {
        setError('customDomain', {
          type: 'manual',
          message: intl.formatMessage({ id: 'custom.domain.not.valid.error' }),
        })
      }
      if (errorCode === 'CNAME_NOT_VALID') {
        setError('customDomain', {
          type: 'manual',
          message: isRootDomain()
            ? intl.formatMessage({ id: 'root.domain.not.valid.error' })
            : intl.formatMessage({ id: 'cname.not.valid.error' }),
        })
      }
      if (errorCode === 'ERROR_DEPLOYER_API') {
        return mutationErrorToast(intl)
      }
      if (siteSettings?.status === 'ACTIVE' && siteSettings.customDomain) {
        toast({
          variant: 'success',
          content: intl.formatMessage({ id: 'custom.domain.redirect' }, { customDomain: siteSettings.customDomain }),
        })
        // we add a timeout to let the user see the toast and not redirect him too quickly
        setTimeout(() => {
          window.location.href = `https://${siteSettings.customDomain}`
        }, 20000)
      }
    })
  }

  const resetCustomDomainField = () => {
    setValue('customDomain', '')
  }

  const customDomainFieldValue = watch('customDomain')

  return (
    <Box bg="white" p={6} borderRadius="8px" mb={8} as="form" id={formName} onSubmit={handleSubmit(onSubmit)}>
      <Heading as="h4" color="blue.800" fontWeight={600} mb={4}>
        {intl.formatMessage({ id: 'domain.name' })}
      </Heading>
      <Flex mb={4} justifyContent="space-between">
        <Box flex={0.5}>
          <Box width="560px">
            <Text fontWeight={600}>{intl.formatMessage({ id: 'capco.subdomain' })}</Text>
            <Text>{intl.formatMessage({ id: 'capco.subdomain.description' })}</Text>
          </Box>
        </Box>
        <FormControl name="subDomain" control={control} flex={0.5} isRequired>
          <FormLabel htmlFor="subDomain" label={intl.formatMessage({ id: 'sub-domain' })} />
          <FieldInput
            id="subDomain"
            name="subDomain"
            control={control}
            type="text"
            disabled
            placeholder={intl.formatMessage({
              id: 'admiun.project.create.title.placeholder',
            })}
          />
        </FormControl>
      </Flex>
      <Flex>
        <Box flex={0.5}>
          <Box width="560px">
            <Text fontWeight={600}>{intl.formatMessage({ id: 'custom-domain' })}</Text>
            <Text>{intl.formatMessage({ id: 'custom-domain.description' })}</Text>
          </Box>
        </Box>
        <Box flex={0.5}>
          <FormControl name="customDomain" control={control} flex={0.5}>
            <FormLabel htmlFor="customDomain" label={intl.formatMessage({ id: 'custom-domain-name' })} />
            <FormGuideline>
              {isRootDomain()
                ? intl.formatMessage(
                    { id: 'root.domain.config' },
                    {
                      link: (
                        <Button
                          as="a"
                          variant="link"
                          target="_blank"
                          href="https://aide.cap-collectif.com/article/274-cname"
                        >
                          A
                        </Button>
                      ),
                    },
                  )
                : intl.formatMessage(
                    { id: 'domain.must.point.to.cname' },
                    {
                      link: (
                        <Button
                          as="a"
                          variant="link"
                          target="_blank"
                          href="https://aide.cap-collectif.com/article/274-cname"
                        >
                          CNAME
                        </Button>
                      ),
                    },
                  )}
              <Text>{intl.formatMessage({ id: 'domain.save.help' })}</Text>
            </FormGuideline>
            <InputGroup>
              {isSubmitting && (
                <Box
                  flex={1}
                  border="1px solid"
                  borderColor="gray.300"
                  borderRadius="normal"
                  lineHeight={CapUILineHeight.Base}
                  px={3}
                  py={1}
                >
                  <Tag
                    variantColor="yellow"
                    onRemove={() => {
                      handleSubmit((data: FormValues) => {
                        data.customDomain = undefined
                        return onSubmit(data)
                      })()
                    }}
                  >
                    <Tag.Label>{customDomainFieldValue}</Tag.Label>
                  </Tag>
                </Box>
              )}
              {status === 'ACTIVE' && (
                <Box
                  flex={1}
                  border="normal"
                  borderColor="gray.300"
                  borderRadius="normal"
                  lineHeight={CapUILineHeight.Base}
                  px={3}
                  py={1}
                >
                  <Tag variantColor="green" onRemove={onOpen}>
                    <Tag.Label>{customDomain}</Tag.Label>
                  </Tag>
                </Box>
              )}
              {status === 'IDLE' && !isSubmitting && (
                <FieldInput
                  id="customDomain"
                  name="customDomain"
                  control={control}
                  type="text"
                  placeholder={intl.formatMessage({ id: 'custom-domain-placeholder' })}
                  disabled={isSubmitting}
                  rules={{
                    pattern: {
                      // https://stackoverflow.com/questions/10306690/what-is-a-regular-expression-which-will-match-a-valid-domain-name-without-a-subd
                      value:
                        /^((?!-))((xn--)?[a-z0-9][a-z0-9-_]{0,61}[a-z0-9]{0,1}\.){0,}(xn--)?([a-z0-9\-]{1,61}|[a-z0-9-]{1,30}\.[a-z]{2,})$/i,
                      message: intl.formatMessage({ id: 'custom.domain.not.valid.error' }),
                    },
                  }}
                />
              )}
              {isSubmitting && (
                <Button variant="primary" type="submit" isLoading>
                  <Tooltip label={intl.formatMessage({ id: 'custom-domain-verification-help-message' })}>
                    <Text>{intl.formatMessage({ id: 'ongoing-check' })}</Text>
                  </Tooltip>
                </Button>
              )}
              {status === 'IDLE' && !isSubmitting && (
                <Button variant="primary" type="submit" disabled={!customDomainFieldValue}>
                  {intl.formatMessage({ id: 'global.use' })}
                </Button>
              )}
            </InputGroup>
          </FormControl>
        </Box>
      </Flex>
      <DeleteCustomDomainModal
        siteSettings={query.siteSettings}
        show={isOpen}
        onClose={onClose}
        onSuccess={resetCustomDomainField}
      />
    </Box>
  )
}

export default Domain
