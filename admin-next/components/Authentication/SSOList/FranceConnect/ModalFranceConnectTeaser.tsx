import type { FC } from 'react'
import {
  Button,
  CapUIFontWeight,
  CapUIIcon,
  CapUIIconSize,
  CapUIModalSize,
  Flex,
  Heading,
  Icon,
  Modal,
  Tag,
  Text,
} from '@cap-collectif/ui'
import { IntlShape, useIntl } from 'react-intl'
import logoBlue from './LogoBlue'
import React from 'react'

type ModalFranceConnectTeaserProps = {
  readonly organizationName: string
}

const generateMailTo = (intl: IntlShape, organizationName: string) => {
  const email = 'commercial@cap-collectif.com'
  const subject = intl.formatMessage({ id: 'france.connect.mailto.subject' }, { organizationName })
  const body = intl.formatMessage({ id: 'france.connect.mailto.body' })

  return `mailto:${email}?subject=${subject}&body=${body}`
}

const ModalFranceConnectTeaser: FC<ModalFranceConnectTeaserProps> = ({ organizationName }) => {
  const intl = useIntl()

  return (
    <Modal
      disclosure={
        <Button variantColor="primary" variant="tertiary" alternative>
          {intl.formatMessage({ id: 'global.install' })}
        </Button>
      }
      ariaLabel={intl.formatMessage({ id: 'activate.france.connect' })}
      size={CapUIModalSize.Md}
    >
      <Modal.Header>
        <Modal.Header.Label>{intl.formatMessage({ id: 'activate.france.connect' })}</Modal.Header.Label>
        <Heading>{intl.formatMessage({ id: 'secure.and.simplify.the.connection' })}</Heading>
      </Modal.Header>
      <Modal.Body>
        <Text fontSize={2} color="gray.900" mb={6}>
          {intl.formatMessage({ id: 'france.connect.business.contact' })}
        </Text>
        <Flex bg="blue.100" border="normal" borderColor="blue.200" align="center" py={6} direction="column">
          {logoBlue}

          <Text color="blue.900" my={4}>
            <Text as="span" fontSize={6} fontWeight={CapUIFontWeight.Semibold}>
              1000
            </Text>
            <Text as="span" fontSize={4}>
              € HT
            </Text>
          </Text>

          <Tag variantColor="green">
            <Tag.Label>{intl.formatMessage({ id: 'france.connect.discount' })}</Tag.Label>
          </Tag>

          <Flex as="ul" direction="column" color="blue.800">
            {[
              'france.connect.unique.user.per.account',
              'france.connect.infos.verified',
              'france.connect.participants.time.saver',
            ].map((label, idx) => (
              <Flex direction="row" spacing={1} key={idx}>
                <Icon name={CapUIIcon.CheckO} size={CapUIIconSize.Md} color="blue.500" />
                <Text>
                  {intl.formatMessage({
                    id: label,
                  })}
                </Text>
              </Flex>
            ))}
          </Flex>
        </Flex>

        <Text color="gray.700" mt={4} fontSize={1}>
          {intl.formatMessage({ id: 'france.connect.municipalities.less.than' }, { n: '10 000' })}
        </Text>
      </Modal.Body>
      <Modal.Footer
        info={{
          url: 'https://aide.cap-collectif.com/article/233-proposer-france-connect-a-linscription',
          label: intl.formatMessage({ id: 'learn.more' }),
        }}
      >
        <Button
          variant="primary"
          variantColor="primary"
          variantSize="big"
          onClick={() => {
            window.open(generateMailTo(intl, organizationName))
          }}
        >
          {intl.formatMessage({
            id: 'contact.us',
          })}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ModalFranceConnectTeaser
