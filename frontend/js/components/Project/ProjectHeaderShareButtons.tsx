import * as React from 'react'
import { useDisclosure } from '@liinkiing/react-hooks'
import { useIntl } from 'react-intl'
import { Button, Heading, Modal, CapUIModalSize, BoxProps } from '@cap-collectif/ui'
import ProjectHeader from '~ui/Project/ProjectHeader'
import share from '~/utils/share'
import useFeatureFlag from '~/utils/hooks/useFeatureFlag'
import ResetCss from '~/utils/ResetCss'
import '~ui/Primitives/AppBox.type'
export type Props = BoxProps & {
  readonly url: string
  readonly title: string
}

const ProjectHeaderShareButtons = ({ url, title, ...rest }: Props) => {
  const hasShareButtons = useFeatureFlag('share_buttons')
  const intl = useIntl()
  const { isOpen, onOpen, onClose } = useDisclosure(false)

  const renderModal = () => {
    return (
      <Modal
        baseId="project-header-share-buttons-modal"
        show={isOpen}
        onClose={onClose}
        ariaLabel={intl.formatMessage({
          id: 'share.link',
        })}
        size={CapUIModalSize.Lg}
      >
        <ResetCss>
          <Modal.Header>
            <Heading>
              {intl.formatMessage({
                id: 'share.link',
              })}
            </Heading>
          </Modal.Header>
        </ResetCss>
        <Modal.Body>
          <p className="excerpt">{title}</p>
          <textarea
            title={intl.formatMessage({
              id: 'share.link',
            })}
            readOnly
            rows={3}
          >
            {url}
          </textarea>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" variantSize="medium" onClick={onClose}>
            {intl.formatMessage({
              id: 'global.close',
            })}
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }

  if (!hasShareButtons) {
    return null
  }

  return (
    <ProjectHeader.Socials {...rest}>
      <ProjectHeader.Social
        onClick={() => {
          share(title, url, 'facebook')
        }}
        name="FACEBOOK"
        ariaLabel={intl.formatMessage({
          id: 'share-link-facebook',
        })}
      />
      <ProjectHeader.Social
        onClick={() => {
          share(title, url, 'twitter')
        }}
        name="TWITTER"
        ariaLabel={intl.formatMessage({
          id: 'share-link-twitter',
        })}
      />
      <ProjectHeader.Social
        onClick={onOpen}
        name="LINK"
        ariaLabel={intl.formatMessage({
          id: 'open-share-link-modal',
        })}
      />
      {renderModal()}
    </ProjectHeader.Socials>
  )
}

export default ProjectHeaderShareButtons
