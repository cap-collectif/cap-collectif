import React, { FC } from 'react'
import { useIntl } from 'react-intl'
import { useDisclosure } from '@liinkiing/react-hooks'
import { Box, BoxProps, Button, CapUIModalSize, Heading, Modal } from '@cap-collectif/ui'
import CookieContent from './CookieContent'
import { layoutQuery$data } from '@relay/layoutQuery.graphql'

export const CookieModal: FC<BoxProps & { separator?: React.ReactNode; SSRData: layoutQuery$data }> = ({
  SSRData,
  ...rest
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure(false)
  const intl = useIntl()

  return (
    <div className="cookie-policy">
      <Box as="button" type="button" id="cookies-modal-button" onClick={onOpen} {...rest}>
        {intl.formatMessage({ id: 'cookies' })}
      </Box>
      {isOpen ? (
        <Modal
          show={isOpen}
          onClose={onClose}
          size={CapUIModalSize.Xl}
          id="cookies-modal"
          ariaLabel={intl.formatMessage({ id: 'cookies' })}
          aria-labelledby="contained-modal-title-lg"
        >
          <Modal.Header
            closeIconLabel={intl.formatMessage({
              id: 'close.modal',
            })}
          >
            <Heading>{intl.formatMessage({ id: 'cookies' })}</Heading>
          </Modal.Header>
          <Modal.Body>
            <CookieContent SSRData={SSRData} />
          </Modal.Body>
          <Modal.Footer>
            <Button variantSize="big" variant="secondary" onClick={onClose}>
              {intl.formatMessage({ id: 'global.close' })}
            </Button>
          </Modal.Footer>
        </Modal>
      ) : null}
    </div>
  )
}
export default CookieModal
