import * as React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import { useDisclosure } from '@liinkiing/react-hooks'
import CloseButton from '../Form/CloseButton'
import Cookie from './Cookie'
import CookieMonster from '../../CookieMonster'
import type { State } from '~/types'
import Flex from '~ui/Primitives/Layout/Flex'
import Text from '~ui/Primitives/Text'
import { LinkSeparator, CookieBanner, ButtonParameters, ButtonDecline, ButtonAccept } from './CookieManagerModal.style'
import Modal from '~ds/Modal/Modal'
import Heading from '~ui/Primitives/Heading'
type Props = {
  readonly analyticsJs: string | null | undefined
  readonly adJs: string | null | undefined
  readonly separator?: string
  readonly cookieTrad?: string | null | undefined
  readonly isLink?: boolean
}
export const CookieManagerModal = ({ isLink = false, analyticsJs, adJs, cookieTrad, separator }: Props) => {
  const intl = useIntl()
  const { isOpen, onOpen, onClose } = useDisclosure(false)
  const cookie = React.useRef(null)
  const changeShowModalState = React.useCallback(() => {
    const hash = window.location.href.split('#')

    if (
      Array.isArray(hash) &&
      hash[1] !== null &&
      typeof hash[1] !== 'undefined' &&
      hash[1] === 'cookiesManagement' &&
      isOpen === false
    ) {
      onOpen()
      const noHashURL = window.location.href.replace(/#.*$/, '')
      window.history.replaceState('', document.title, noHashURL)
    }
  }, [isOpen, onOpen])
  React.useEffect(() => {
    if (isLink) window.addEventListener('hashchange', changeShowModalState, false)
    return () => {
      if (isLink) window.removeEventListener('hashchange', changeShowModalState, false)
    }
  }, [changeShowModalState, isLink])

  const saveCookie = () => {
    if (cookie && cookie.current) cookie.current.saveCookiesConfiguration()
    onClose()
  }

  if (!analyticsJs && !adJs) {
    return null
  }

  return (
    <div className="cookie-manager">
      {isLink ? (
        <div>
          {separator && <LinkSeparator>{separator} </LinkSeparator>}
          <Button variant="link" bsStyle="link" className="p-0" id="cookies-management" onClick={onOpen}>
            <FormattedMessage id={cookieTrad || 'cookies-management'} />
          </Button>
        </div>
      ) : (
        <CookieBanner id="cookie-banner" className="cookie-banner">
          <Flex direction="column" spacing={2} className="cookie-text-wrapper">
            <Text>
              {intl.formatMessage({
                id: 'cookies-text',
              })}
            </Text>

            <ButtonParameters id="cookies-parameters" onClick={onOpen}>
              {intl.formatMessage({
                id: 'setup-cookies',
              })}
            </ButtonParameters>
          </Flex>

          <div className="cookie-button">
            <ButtonDecline
              id="cookie-decline-button"
              onClick={() => {
                CookieMonster.doNotConsiderFullConsent(true)
              }}
            >
              {intl.formatMessage({
                id: 'decline-optional-cookies',
              })}
            </ButtonDecline>

            <ButtonAccept
              id="cookie-consent"
              className="btn-cookie-consent"
              onClick={() => {
                CookieMonster.considerFullConsent()
              }}
            >
              {intl.formatMessage({
                id: 'accept-everything',
              })}
            </ButtonAccept>
          </div>
        </CookieBanner>
      )}

      <Modal
        show={isOpen}
        onClose={onClose}
        ariaLabel={intl.formatMessage({
          id: 'cookies-management',
        })}
        className="modal-cookie-manager"
      >
        <Modal.Header>
          <Heading>
            {intl.formatMessage({
              id: 'cookies-management',
            })}
          </Heading>
        </Modal.Header>
        <Modal.Body>
          <Cookie analyticsJs={analyticsJs} adJs={adJs} ref={cookie} intl={intl} />
        </Modal.Body>
        <Modal.Footer spacing={2}>
          <CloseButton buttonId="cookies-cancel" onClose={onClose} />
          <button type="submit" className="btn btn-primary" id="cookies-save" onClick={saveCookie}>
            {intl.formatMessage({
              id: 'global.save',
            })}
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

const mapStateToProps = (state: State) => ({
  analyticsJs: state.default.parameters['snalytical-tracking-scripts-on-all-pages'],
  adJs: state.default.parameters['ad-scripts-on-all-pages'],
})

export default connect<any, any>(mapStateToProps)(CookieManagerModal)
