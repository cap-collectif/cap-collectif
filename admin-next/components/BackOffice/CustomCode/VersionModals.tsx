import { Button, CapUIModalSize, Flex, Heading, Modal } from '@cap-collectif/ui'
import { FC } from 'react'
import { useIntl } from 'react-intl'
import { usePreloadedQuery } from 'react-relay'
import { CUSTOM_CODE_DIFF_VERSION_QUERY, CUSTOM_CODE_VERSION_QUERY } from './CustomCodeVersioningPage.queries'
import { DiffView, ReadOnlyCodeView } from './CustomCodeEditor'
import { VersionContentQueryReference, VersionDiffQueryReference } from './customCodeVersioning.types'

type VersionContentModalContainerProps = {
  versionTitle: string
  queryReference: VersionContentQueryReference
  onClose: () => void
}

export const VersionContentModalContainer: FC<VersionContentModalContainerProps> = ({
  versionTitle,
  queryReference,
  onClose,
}) => {
  const data = usePreloadedQuery(CUSTOM_CODE_VERSION_QUERY, queryReference)

  return (
    <VersionContentModal
      title={data.customCodeVersion?.title ?? versionTitle}
      content={data.customCodeVersion?.content ?? ''}
      onClose={onClose}
    />
  )
}

type VersionContentModalProps = {
  title: string
  content: string
  onClose: () => void
}

export const VersionContentModal: FC<VersionContentModalProps> = ({ title, content, onClose }) => {
  const intl = useIntl()

  return (
    <Modal
      show
      onClose={onClose}
      size={CapUIModalSize.Xl}
      ariaLabel={intl.formatMessage({ id: 'admin.custom-code.view-content' })}
    >
      <Modal.Header>
        <Heading>{intl.formatMessage({ id: 'admin.custom-code.content-title' }, { title })}</Heading>
      </Modal.Header>
      <Modal.Body>
        <ReadOnlyCodeView content={content} />
      </Modal.Body>
      <Modal.Footer>
        <Button type="button" variant="primary" onClick={onClose}>
          {intl.formatMessage({ id: 'global.close' })}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

type VersionContentModalSkeletonProps = {
  versionTitle: string
  onClose: () => void
}

export const VersionContentModalSkeleton: FC<VersionContentModalSkeletonProps> = ({ versionTitle, onClose }) => {
  const intl = useIntl()

  return (
    <Modal
      show
      onClose={onClose}
      size={CapUIModalSize.Xl}
      ariaLabel={intl.formatMessage({ id: 'admin.custom-code.view-content' })}
    >
      <Modal.Header>
        <Heading>{intl.formatMessage({ id: 'admin.custom-code.content-title' }, { title: versionTitle })}</Heading>
      </Modal.Header>
      <Modal.Body>
        <CodeModalLoading />
      </Modal.Body>
    </Modal>
  )
}

type VersionDiffModalContainerProps = {
  versionTitle: string
  queryReference: VersionDiffQueryReference
  previousQueryReference: VersionDiffQueryReference | null
  onClose: () => void
}

export const VersionDiffModalContainer: FC<VersionDiffModalContainerProps> = ({
  versionTitle,
  queryReference,
  previousQueryReference,
  onClose,
}) => {
  const data = usePreloadedQuery(CUSTOM_CODE_DIFF_VERSION_QUERY, queryReference)

  if (previousQueryReference) {
    return (
      <VersionDiffModalWithPreviousContent
        title={data.customCodeVersion?.title ?? versionTitle}
        previousQueryReference={previousQueryReference}
        nextContent={data.customCodeVersion?.content ?? ''}
        onClose={onClose}
      />
    )
  }

  return (
    <VersionDiffModal
      title={data.customCodeVersion?.title ?? versionTitle}
      previousContent=""
      nextContent={data.customCodeVersion?.content ?? ''}
      onClose={onClose}
    />
  )
}

type VersionDiffModalWithPreviousContentProps = {
  title: string
  previousQueryReference: VersionDiffQueryReference
  nextContent: string
  onClose: () => void
}

const VersionDiffModalWithPreviousContent: FC<VersionDiffModalWithPreviousContentProps> = ({
  title,
  previousQueryReference,
  nextContent,
  onClose,
}) => {
  const previousData = usePreloadedQuery(CUSTOM_CODE_DIFF_VERSION_QUERY, previousQueryReference)

  return (
    <VersionDiffModal
      title={title}
      previousContent={previousData.customCodeVersion?.content ?? ''}
      nextContent={nextContent}
      onClose={onClose}
    />
  )
}

type VersionDiffModalProps = {
  title: string
  previousContent: string
  nextContent: string
  onClose: () => void
}

export const VersionDiffModal: FC<VersionDiffModalProps> = ({ title, previousContent, nextContent, onClose }) => {
  const intl = useIntl()

  return (
    <Modal
      show
      onClose={onClose}
      size={CapUIModalSize.Xl}
      ariaLabel={intl.formatMessage({ id: 'admin.custom-code.view-diff' })}
    >
      <Modal.Header>
        <Heading>{intl.formatMessage({ id: 'admin.custom-code.diff-title' }, { title })}</Heading>
      </Modal.Header>
      <Modal.Body>
        <DiffView previousContent={previousContent} nextContent={nextContent} />
      </Modal.Body>
      <Modal.Footer>
        <Button type="button" variant="primary" onClick={onClose}>
          {intl.formatMessage({ id: 'global.close' })}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

type VersionDiffModalSkeletonProps = {
  versionTitle: string
  onClose: () => void
}

export const VersionDiffModalSkeleton: FC<VersionDiffModalSkeletonProps> = ({ versionTitle, onClose }) => {
  const intl = useIntl()

  return (
    <Modal
      show
      onClose={onClose}
      size={CapUIModalSize.Xl}
      ariaLabel={intl.formatMessage({ id: 'admin.custom-code.view-diff' })}
    >
      <Modal.Header>
        <Heading>{intl.formatMessage({ id: 'admin.custom-code.diff-title' }, { title: versionTitle })}</Heading>
      </Modal.Header>
      <Modal.Body>
        <CodeModalLoading />
      </Modal.Body>
    </Modal>
  )
}

const CodeModalLoading: FC = () => {
  const intl = useIntl()

  return (
    <Flex align="center" justify="center" height="520px" bg="gray.900" color="gray.100" borderRadius="8px">
      {intl.formatMessage({ id: 'admin.custom-code.loading-content' })}
    </Flex>
  )
}
