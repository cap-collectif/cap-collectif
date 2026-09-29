import { Box, Flex, Grid, Heading, Text } from '@cap-collectif/ui'
import { CustomCodeVersioningPageQuery } from '@relay/CustomCodeVersioningPageQuery.graphql'
import { useAppContext } from '@components/BackOffice/AppProvider/App.context'
import { FC, Suspense, useEffect, useRef, useState, useTransition } from 'react'
import { useIntl } from 'react-intl'
import { useLazyLoadQuery } from 'react-relay'
import { CommitCustomCodeModal } from './CommitCustomCodeModal'
import { CustomCodeEditorPanel } from './CustomCodeEditorPanel'
import { CustomCodeHistory } from './CustomCodeHistory'
import { CustomCodeKeynameList } from './CustomCodeKeynameList'
import { QUERY } from './CustomCodeVersioningPage.queries'
import { DraftDiffModal } from './DraftDiffModal'
import { FullscreenCustomCodeEditorModal } from './FullscreenCustomCodeEditorModal'
import { RestoreCustomCodeModal } from './RestoreCustomCodeModal'
import {
  VersionContentModalContainer,
  VersionContentModalSkeleton,
  VersionDiffModalContainer,
  VersionDiffModalSkeleton,
} from './VersionModals'
import { ActiveCustomCodeModal } from './customCodeVersioning.types'
import { HISTORY_PAGE_SIZE } from './customCodeVersioning.utils'
import { useCustomCodeCommitRestore } from './useCustomCodeCommitRestore'
import { useCustomCodeItemsState } from './useCustomCodeItemsState'
import { useCustomCodeVersionBrowser } from './useCustomCodeVersionBrowser'

const INITIAL_VERSIONS_COUNT = HISTORY_PAGE_SIZE + 1

const CustomCodeVersioningPage: FC = () => {
  const intl = useIntl()
  const { viewerSession } = useAppContext()

  if (!viewerSession.isAdmin && !viewerSession.isSuperAdmin) {
    return (
      <Box bg="white" borderRadius="8px" p={6}>
        <Heading as="h3" color="blue.800" fontWeight={600} mb={2}>
          {intl.formatMessage({ id: 'admin.custom-code.restricted-title' })}
        </Heading>
        <Text color="gray.700">{intl.formatMessage({ id: 'admin.custom-code.restricted-description' })}</Text>
      </Box>
    )
  }

  return <CustomCodeVersioningContent />
}

const CustomCodeVersioningContent: FC = () => {
  const intl = useIntl()
  const [versionsFirst, setVersionsFirst] = useState(INITIAL_VERSIONS_COUNT)
  const [isLoadingMoreVersions, startLoadingMoreVersions] = useTransition()
  const data = useLazyLoadQuery<CustomCodeVersioningPageQuery>(QUERY, { versionsFirst })
  const customCode = useCustomCodeItemsState(data)
  const [activeModal, setActiveModal] = useState<ActiveCustomCodeModal>({ type: 'none' })
  const activeModalRef = useRef(activeModal)
  const diffRequestIdRef = useRef(0)
  const versionBrowser = useCustomCodeVersionBrowser({
    activeModalRef,
    diffRequestIdRef,
    selectedItem: customCode.selectedItem,
    setActiveModal,
  })
  const commitRestore = useCustomCodeCommitRestore({
    activeModal,
    draftContent: customCode.draftContent,
    hasUnsavedChanges: customCode.hasUnsavedChanges,
    selectedItem: customCode.selectedItem,
    setActiveModal,
    versionsFirst,
  })

  useEffect(() => {
    activeModalRef.current = activeModal
  }, [activeModal])

  const closeModal = () => {
    diffRequestIdRef.current += 1
    setActiveModal({ type: 'none' })
    versionBrowser.disposeVersionQueries()
    commitRestore.resetForm()
  }

  const selectKeyname = (keyname: string) => {
    closeModal()
    customCode.setSelectedKeyname(keyname)
  }

  const openDraftDiff = () => setActiveModal({ type: 'draftDiff' })
  const openEditorFullscreen = () => setActiveModal({ type: 'fullscreenEditor' })
  const loadMoreVersions = () => {
    startLoadingMoreVersions(() => setVersionsFirst(currentVersionsFirst => currentVersionsFirst + HISTORY_PAGE_SIZE))
  }

  return (
    <Flex direction="column" spacing={6}>
      <Box bg="white" borderRadius="8px" p={6}>
        <Flex justify="space-between" align="flex-start" gap={6}>
          <Box maxWidth="760px">
            <Heading as="h3" color="blue.800" fontWeight={600} mb={2}>
              {intl.formatMessage({ id: 'admin.custom-code.title' })}
            </Heading>
            <Text color="gray.700">{intl.formatMessage({ id: 'admin.custom-code.description' })}</Text>
          </Box>
        </Flex>
      </Box>

      {customCode.isEmpty || !customCode.selectedItem ? (
        <Box bg="white" borderRadius="8px" p={6}>
          <Heading as="h4" color="blue.800" fontWeight={600} mb={2}>
            {intl.formatMessage({ id: 'admin.custom-code.empty-title' })}
          </Heading>
          <Text color="gray.700">{intl.formatMessage({ id: 'admin.custom-code.empty-description' })}</Text>
        </Box>
      ) : (
        <>
          <Grid gap={6} templateColumns={['1fr', '1fr', '360px minmax(0, 1fr)']}>
            <CustomCodeKeynameList
              items={customCode.items}
              selectedKeyname={customCode.selectedKeyname}
              onSelect={selectKeyname}
            />

            <Flex direction="column" spacing={6} minWidth={0}>
              <CustomCodeEditorPanel
                currentVersion={customCode.currentVersion}
                draftContent={customCode.draftContent}
                hasUnsavedChanges={customCode.hasUnsavedChanges}
                selectedItem={customCode.selectedItem}
                onDraftChange={customCode.setDraftContent}
                onOpenCommit={commitRestore.openCommitModal}
                onOpenDraftDiff={openDraftDiff}
                onOpenFullscreen={openEditorFullscreen}
                onResetDraft={customCode.resetDraftContent}
              />

              <CustomCodeHistory
                hasMoreVersions={customCode.selectedItem.hasMoreVersions}
                isLoadingMoreVersions={isLoadingMoreVersions}
                previousVersions={customCode.previousVersions}
                previousVersionsCount={customCode.previousVersionsCount}
                onLoadMore={loadMoreVersions}
                onOpenDiff={versionBrowser.openVersionDiff}
                onOpenRestore={commitRestore.openRestoreModal}
                onOpenView={versionBrowser.openVersionView}
              />
            </Flex>
          </Grid>

          <CommitCustomCodeModal
            canSubmit={commitRestore.canSubmitCommit}
            control={commitRestore.commitFormControl}
            errorMessage={commitRestore.formErrorMessage}
            isLoading={commitRestore.isCommitLoading}
            isOpen={activeModal.type === 'commit'}
            onClose={closeModal}
            onSubmit={commitRestore.commit}
          />

          <RestoreCustomCodeModal
            canSubmit={commitRestore.canSubmitRestore}
            control={commitRestore.commitFormControl}
            errorMessage={commitRestore.formErrorMessage}
            isLoading={commitRestore.isRestoreLoading}
            version={activeModal.type === 'restore' ? activeModal.version : null}
            onClose={closeModal}
            onSubmit={commitRestore.restore}
          />

          <FullscreenCustomCodeEditorModal
            draftContent={customCode.draftContent}
            isOpen={activeModal.type === 'fullscreenEditor'}
            keyname={customCode.selectedItem.keyname}
            label={customCode.selectedItem.label}
            onClose={closeModal}
            onDraftChange={customCode.setDraftContent}
          />

          <DraftDiffModal
            isOpen={activeModal.type === 'draftDiff'}
            previousContent={customCode.selectedItem.value}
            nextContent={customCode.draftContent}
            onClose={closeModal}
          />

          {activeModal.type === 'versionDiff' && versionBrowser.diffVersionQueryReference ? (
            <Suspense
              fallback={<VersionDiffModalSkeleton versionTitle={activeModal.version.title} onClose={closeModal} />}
            >
              <VersionDiffModalContainer
                versionTitle={activeModal.version.title}
                queryReference={versionBrowser.diffVersionQueryReference}
                previousQueryReference={versionBrowser.previousDiffVersionQueryReference}
                onClose={closeModal}
              />
            </Suspense>
          ) : null}

          {activeModal.type === 'versionContent' && versionBrowser.viewVersionQueryReference ? (
            <Suspense
              fallback={<VersionContentModalSkeleton versionTitle={activeModal.version.title} onClose={closeModal} />}
            >
              <VersionContentModalContainer
                versionTitle={activeModal.version.title}
                queryReference={versionBrowser.viewVersionQueryReference}
                onClose={closeModal}
              />
            </Suspense>
          ) : null}
        </>
      )}
    </Flex>
  )
}

export default CustomCodeVersioningPage
