import * as React from 'react'
import { useIntl } from 'react-intl'
import Flex from '~ui/Primitives/Layout/Flex'
import Text from '~ui/Primitives/Text'
import CopyLinkButton from '~ui/Link/CopyLinkButton'
import Icon from '~ds/Icon/Icon'
import type { Step } from '~ds/ModalSteps/ModalSteps.context'
type DataDkim = {
  readonly subDomain: string
  readonly value: string
}
type Props = Step & {
  readonly dkim: DataDkim
}

const ModalDNSRegistration = ({ dkim }: Props): JSX.Element => {
  const intl = useIntl()
  const spfValue = 'v=spf1 include:spf.cap-collectif.com ~all'
  return (
    <Flex direction="column" spacing={6} color="gray.900">
      <Flex direction="column" spacing={1}>
        <Text>
          <Text as="span" fontWeight="bold">
            {`${intl.formatMessage({
              id: 'spf-authentication',
            })}, `}
          </Text>
          <Text as="span">
            {intl.formatHTMLMessage({
              id: 'add-entry-to-dns-area',
            })}
          </Text>
        </Text>

        <Flex direction="column" spacing={1}>
          <Text>
            {intl.formatMessage({
              id: 'global.value',
            })}
          </Text>
          <Flex
            direction="row"
            justify="space-between"
            px={3}
            py={1}
            border="normal"
            borderColor="gray.300"
            borderRadius="normal"
          >
            <Text>{spfValue}</Text>
            <CopyLinkButton value={spfValue}>
              <Icon name="DUPLICATE" size="md" color="gray.500" />
            </CopyLinkButton>
          </Flex>
        </Flex>
      </Flex>

      <Flex direction="column" spacing={1}>
        <Text>
          <Text as="span" fontWeight="bold">
            {`${intl.formatMessage({
              id: 'dkim-authentication',
            })}, `}
          </Text>
          <Text as="span">
            {intl.formatHTMLMessage({
              id: 'add-entry-to-dns-area',
            })}
          </Text>
        </Text>

        <Flex direction="row" justify="space-between" spacing={6}>
          <Flex direction="column" spacing={1} width="50%">
            <Text>
              {intl.formatMessage({
                id: 'sub-domain',
              })}
            </Text>
            <Flex
              direction="row"
              justify="space-between"
              px={3}
              py={1}
              border="normal"
              borderColor="gray.300"
              borderRadius="normal"
            >
              <Text>{dkim.subDomain}</Text>
              <CopyLinkButton value={dkim.subDomain}>
                <Icon name="DUPLICATE" size="md" color="gray.500" />
              </CopyLinkButton>
            </Flex>
          </Flex>

          <Flex direction="column" spacing={1} width="50%">
            <Text>
              {intl.formatMessage({
                id: 'global.value',
              })}
            </Text>
            <Flex
              direction="row"
              justify="space-between"
              px={3}
              py={1}
              border="normal"
              borderColor="gray.300"
              borderRadius="normal"
            >
              <Text
                overflow="hidden"
                css={{
                  textOverflow: 'ellipsis',
                  whiteSpace: 'pre',
                }}
              >
                {dkim.value}
              </Text>
              <CopyLinkButton value={dkim.value}>
                <Icon name="DUPLICATE" size="md" color="gray.500" />
              </CopyLinkButton>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  )
}

export default ModalDNSRegistration
