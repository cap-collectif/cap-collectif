import type { FC } from 'react'
import { FormattedHTMLMessage, useIntl } from 'react-intl'
import {
  CapUISpotIcon,
  CapUISpotIconSize,
  Flex,
  headingStyles,
  SpotIcon,
  Text,
  Modal,
  Heading,
  Button,
  toast,
  useMultiStepModal,
} from '@cap-collectif/ui'
import getFileDownloadUrl from '../FileDownload'
import { CreateUserIdentificationCodeListMutation$data } from '@relay/CreateUserIdentificationCodeListMutation.graphql'

type ModalDownloadListProps = {
  codesCount: number
  response: CreateUserIdentificationCodeListMutation$data | undefined
}

const ModalDownloadList: FC<ModalDownloadListProps> = ({ codesCount, response }) => {
  const intl = useIntl()
  const { hide } = useMultiStepModal()

  const onClick = () => {
    window.open(
      getFileDownloadUrl(response?.createUserIdentificationCodeList?.userIdentificationCodeList?.id || ''),
      '_blank',
    )
    toast({
      variant: 'success',
      content: intl.formatMessage({ id: 'downloaded-list-please-communicate' }),
    })
    hide()
  }

  return (
    <>
      <Modal.Header>
        <Heading>{intl.formatMessage({ id: 'download-list' })}</Heading>
      </Modal.Header>
      <Modal.Body>
        <Flex direction="column" align="center" textAlign="center" color="gray.900">
          <SpotIcon name={CapUISpotIcon.CODES} size={CapUISpotIconSize.Lg} />
          <Text {...headingStyles.h4} my={4}>
            <FormattedHTMLMessage
              id="identification-codes-associated-to-each-one"
              values={{
                count: codesCount,
              }}
            />
          </Text>
          <Text {...headingStyles.h4}>
            {intl.formatMessage({
              id: 'download-and-send-codes-before-enable',
            })}
          </Text>
        </Flex>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" variantColor="primary" variantSize="medium" onClick={onClick}>
          {intl.formatMessage({ id: 'global.download' })}
        </Button>
      </Modal.Footer>
    </>
  )
}

export default ModalDownloadList
